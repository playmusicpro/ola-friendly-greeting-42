import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { corsHeaders, getAdminClient, getStripe, json, mapOffer, type Offer } from "../_shared/billing.ts";
import { invoiceSubscriptionId, isPaidInvoiceEvent } from "./invoice.ts";

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function log(step: string, details?: unknown) {
  console.log(`[stripe-webhook] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
}

async function offerByKeyOrPrice(
  admin: ReturnType<typeof getAdminClient>,
  offerKey: string | null | undefined,
  priceId: string | null | undefined,
): Promise<Offer | null> {
  if (offerKey) {
    const { data } = await admin.from("stripe_offers").select("*").eq("key", offerKey).maybeSingle();
    if (data) return mapOffer(data as Record<string, unknown>);
  }
  if (priceId) {
    const { data } = await admin.from("stripe_offers").select("*").eq("stripe_price_id", priceId).maybeSingle();
    if (data) return mapOffer(data as Record<string, unknown>);
  }
  return null;
}

async function userIdFrom(
  admin: ReturnType<typeof getAdminClient>,
  stripe: Stripe,
  metaUserId: string | null | undefined,
  email: string | null | undefined,
  customerId: string | null | undefined,
): Promise<string | null> {
  if (metaUserId) return metaUserId;
  let mail = email ?? null;
  if (!mail && customerId) {
    const customer = await stripe.customers.retrieve(customerId as string);
    if (!customer.deleted) mail = customer.email ?? null;
  }
  if (!mail) return null;
  const { data } = await admin.from("profiles").select("id").eq("email", mail).maybeSingle();
  return data?.id ?? null;
}

async function markPaid(session: Stripe.Checkout.Session) {
  const admin = getAdminClient();
  const stripe = getStripe();
  const meta = session.metadata ?? {};

  let priceId: string | null = null;
  try {
    const items = await stripe.checkout.sessions.listLineItems(session.id);
    priceId = items.data[0]?.price?.id ?? null;
  } catch (error) {
    log("não foi possível ler os itens da sessão", message(error));
  }

  const offer = await offerByKeyOrPrice(admin, meta.offer_key, priceId);
  const userId = await userIdFrom(
    admin,
    stripe,
    meta.user_id,
    session.customer_details?.email ?? session.customer_email ?? undefined,
    typeof session.customer === "string" ? session.customer : undefined,
  );

  if (!userId) {
    log("comprador não encontrado no banco", { session: session.id, email: session.customer_details?.email });
    return;
  }

  const couponId = typeof session.discounts?.[0]?.coupon === "string"
    ? (session.discounts[0].coupon as string)
    : null;

  await admin.from("stripe_purchases").upsert(
    {
      user_id: userId,
      stripe_session_id: session.id,
      stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
      stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
      offer_key: offer?.key ?? null,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency ?? "brl",
      coupon_code: couponId,
      affiliate: meta.affiliate || null,
      status: "paid",
      paid_at: new Date().toISOString(),
    },
    { onConflict: "stripe_session_id" },
  );

  if (offer) {
    const { error } = await admin
      .from("profiles")
      .update({
        status: "active",
        plan_type: offer.planType,
        plan: offer.planLabel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw new Error(`Falha ao atualizar o perfil: ${error.message}`);
  } else {
    log("oferta não reconhecida, perfil não alterado", { session: session.id, offerKey: meta.offer_key, priceId });
  }

  if (couponId) {
    const { error } = await admin.rpc("record_coupon_use", { p_code: couponId });
    if (error) log("não foi possível contabilizar o cupom", error.message);
  }

  log("pagamento confirmado", { session: session.id, user: userId, plan: offer?.planType ?? null });
}

async function activateFromInvoice(invoice: Stripe.Invoice) {
  const admin = getAdminClient();
  const stripe = getStripe();
  const subscriptionId = invoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price?.id ?? null;
  const offer = await offerByKeyOrPrice(admin, subscription.metadata?.offer_key, priceId);
  const userId = await userIdFrom(admin, stripe, subscription.metadata?.user_id, null, subscription.customer as string);
  if (!userId || !offer) {
    log("renovação sem oferta/usuário identificado", { invoice: invoice.id, subscription: subscriptionId });
    return;
  }

  const { error } = await admin
    .from("profiles")
    .update({ status: "active", plan_type: offer.planType, plan: offer.planLabel, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw new Error(`Falha ao reativar o perfil: ${error.message}`);
  log("assinatura renovada e plano mantido ativo", { user: userId, plan: offer.planType });
}

async function setPlan(admin: ReturnType<typeof getAdminClient>, userId: string, active: boolean) {
  const { error } = await admin
    .from("profiles")
    .update({
      status: active ? "active" : "canceled",
      plan_type: active ? "monthly" : null,
      plan: active ? "pro" : "free",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) throw new Error(`Falha ao atualizar o perfil: ${error.message}`);
}

async function syncSubscription(subscription: Stripe.Subscription, forceCancel = false) {
  const admin = getAdminClient();
  const stripe = getStripe();
  const priceId = subscription.items.data[0]?.price?.id ?? null;
  const offer = await offerByKeyOrPrice(admin, subscription.metadata?.offer_key, priceId);
  const userId = await userIdFrom(admin, stripe, subscription.metadata?.user_id, null, subscription.customer as string);
  if (!userId) {
    log("assinatura sem usuário identificado", { subscription: subscription.id });
    return;
  }
  const active = !forceCancel && (subscription.status === "active" || subscription.status === "trialing");
  await setPlan(admin, userId, active);
  log("situação da assinatura sincronizada", { user: userId, status: subscription.status, active });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) {
    log("STRIPE_WEBHOOK_SECRET não está configurado");
    return json({ error: "STRIPE_WEBHOOK_SECRET não está configurado." }, 500);
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) return json({ error: "Assinatura ausente." }, 400);

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(payload, signature, secret);
  } catch (error) {
    log("assinatura inválida", message(error));
    return json({ error: "Assinatura inválida." }, 400);
  }

  log("evento recebido", { type: event.type, id: event.id });

  try {
    if (isPaidInvoiceEvent(event.type)) {
      await activateFromInvoice(event.data.object as Stripe.Invoice);
      return json({ received: true });
    }
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") {
          await markPaid(session);
        } else {
          log("sessão concluída sem pagamento confirmado", { session: session.id, status: session.payment_status });
        }
        break;
      }
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object as Stripe.Subscription, true);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.paused":
      case "customer.subscription.resumed": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        log("evento ignorado", { type: event.type });
    }
  } catch (error) {
    log("erro ao processar evento", { type: event.type, message: message(error) });
    return json({ error: "Falha ao processar o evento." }, 500);
  }

  return json({ received: true });
});
