import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "npm:zod@3.25.76";
import { checkoutError } from "../_shared/checkout-errors.ts";
import {
  checkCoupon,
  corsHeaders,
  getAdminClient,
  getPublicClient,
  getStripe,
  json,
  loadOffer,
  normalizeCouponCode,
  type Offer,
} from "../_shared/billing.ts";

const BodySchema = z.object({
  action: z.enum(["list_offers", "validate_coupon", "create_session"]),
  offer: z.string().min(1).max(64).optional(),
  couponCode: z.string().min(1).max(64).optional(),
});

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Pedido inválido." }, 400);
  const { action, offer: offerKey, couponCode } = parsed.data;

  let admin;
  try {
    admin = getAdminClient();
  } catch (error) {
    console.error("[stripe-checkout] config", message(error));
    return json({ error: "Servidor de pagamento indisponível. Tente novamente em instantes." }, 500);
  }

  try {
    if (action === "list_offers") {
      const { data, error } = await admin
        .from("stripe_offers")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      const offers = (data ?? []).map((row) => {
        const offer = loadOfferFromRow(row);
        return {
          key: offer.key,
          label: offer.label,
          description: offer.description,
          mode: offer.mode,
          interval: offer.interval,
          priceCents: offer.priceCents,
          currency: offer.currency,
          planType: offer.planType,
          highlight: offer.highlight,
        };
      });
      return json({ offers });
    }

    if (!offerKey) return json({ error: "Escolha uma oferta." }, 400);
    const offer = await loadOffer(admin, offerKey);
    if (!offer) return json({ error: "Oferta indisponível." }, 404);

    if (action === "validate_coupon") {
      if (!couponCode) return json({ error: "Informe um cupom." }, 400);
      const check = await checkCoupon(admin, offer, couponCode);
      if (!check.ok) {
        return json({ valid: false, reason: check.reason, priceCents: offer.priceCents, totalCents: offer.priceCents });
      }
      return json({
        valid: true,
        couponCode: check.coupon?.code ?? normalizeCouponCode(couponCode),
        affiliate: check.coupon?.affiliate ?? null,
        discountCents: check.discountCents,
        priceCents: offer.priceCents,
        totalCents: check.totalCents,
      });
    }

    // action === "create_session" — needs a logged-in user
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return json({ error: "Faça login para continuar." }, 401);
    const { data: userData, error: userError } = await getPublicClient().auth.getUser(token);
    if (userError || !userData.user?.email) {
      return json({ error: "Sua sessão expirou. Entre novamente." }, 401);
    }
    const user = userData.user;

    let check = { ok: false, reason: "", coupon: null, discountCents: 0, totalCents: offer.priceCents };
    if (couponCode) {
      check = await checkCoupon(admin, offer, couponCode);
      if (!check.ok) return json({ error: check.reason || "Cupom inválido." }, 400);
    }

    const stripe = getStripe();
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data[0]?.id;
    if (!customerId) {
      const created = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.name ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = created.id;
    }

    const origin = req.headers.get("origin") || "https://playprooficial.lovable.app";
    const isOneTime = offer.mode === "payment";
    const successUrl = isOneTime
      ? `${origin}/dashboard?concluido=1&plano=${encodeURIComponent(offer.planType)}&sessao={CHECKOUT_SESSION_ID}`
      : `${origin}/dashboard?concluido=1&plano=${encodeURIComponent(offer.planType)}`;

    const useCoupon = Boolean(check.ok && check.coupon);
    const buildParams = (withCoupon: boolean) => ({
      mode: offer.mode,
      customer: customerId,
      line_items: [{ price: offer.stripePriceId, quantity: 1 }],
      payment_method_types: isOneTime ? ["card", "pix"] : ["card"],
      ...(isOneTime ? { payment_method_options: { card: { installments: { enabled: true } } } } : {}),
      ...(withCoupon && check.coupon
        ? { discounts: [{ coupon: check.coupon.stripeCouponId }] }
        : { allow_promotion_codes: true }),
      metadata: {
        user_id: user.id,
        offer_key: offer.key,
        plan_type: offer.planType,
        coupon_code: check.ok && check.coupon ? check.coupon.code : "",
        affiliate: check.ok && check.coupon?.affiliate ? check.coupon.affiliate : "",
      },
      subscription_data: offer.mode === "subscription"
        ? { metadata: { user_id: user.id, offer_key: offer.key, plan_type: offer.planType } }
        : undefined,
      success_url: successUrl,
      cancel_url: `${origin}/planos?cancelado=1`,
    });
    let session;
    try {
      // deno-lint-ignore no-explicit-any
      session = await stripe.checkout.sessions.create(buildParams(useCoupon) as any);
    } catch (err) {
      // Cupom não existe na conta live: deixa o cliente digitar o código no próprio Stripe.
      if (!useCoupon) throw err;
      console.warn("[stripe-checkout] cupom indisponível no Stripe, usando allow_promotion_codes", message(err));
      // deno-lint-ignore no-explicit-any
      session = await stripe.checkout.sessions.create(buildParams(false) as any);
    }

    // Registro da compra em aberto — o webhook confirma o pagamento depois.
    try {
      await admin.from("stripe_purchases").upsert(
        {
          user_id: user.id,
          stripe_session_id: session.id,
          stripe_customer_id: customerId,
          offer_key: offer.key,
          amount_cents: session.amount_total ?? offer.priceCents,
          currency: session.currency ?? offer.currency,
          coupon_code: check.ok && check.coupon ? check.coupon.code : null,
          affiliate: check.ok && check.coupon?.affiliate ? check.coupon.affiliate : null,
          status: "pending",
        },
        { onConflict: "stripe_session_id" },
      );
    } catch (error) {
      console.error("[stripe-checkout] registro da compra falhou", message(error));
    }

    return json({ url: session.url, sessionId: session.id, totalCents: session.amount_total ?? offer.priceCents });
  } catch (error) {
    const details = checkoutError(error);
    console.error("[stripe-checkout] erro", details.stripeError);
    return json(details, 500);
  }
});

function loadOfferFromRow(row: unknown): Offer {
  const r = row as Record<string, unknown>;
  return {
    key: String(r.key),
    label: String(r.label),
    description: r.description == null ? null : String(r.description),
    mode: r.mode === "subscription" ? "subscription" : "payment",
    interval: r.interval == null ? null : String(r.interval),
    priceCents: Number(r.price_cents),
    currency: String(r.currency ?? "brl"),
    stripePriceId: String(r.stripe_price_id),
    planType: String(r.plan_type),
    planLabel: String(r.plan_label ?? "free"),
    highlight: Boolean(r.highlight),
  };
}
