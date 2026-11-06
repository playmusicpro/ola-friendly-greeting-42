import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.57.2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function getStripe(): Stripe {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY não está configurada");
  return new Stripe(key, { apiVersion: "2025-08-27.basil" });
}

/** Client with elevated privileges — only for server-side writes (edge functions). */
export function getAdminClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não estão configurados");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Client with the public key — used to validate the caller's token. */
export function getPublicClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_ANON_KEY não estão configurados");
  return createClient(url, key, { auth: { persistSession: false } });
}

export type Offer = {
  key: string;
  label: string;
  description: string | null;
  mode: "payment" | "subscription";
  interval: string | null;
  priceCents: number;
  currency: string;
  stripePriceId: string;
  planType: string;
  planLabel: string;
  highlight: boolean;
};

export type Coupon = {
  code: string;
  stripeCouponId: string;
  offerKey: string | null;
  affiliate: string | null;
  discountCents: number;
};

export function mapOffer(row: Record<string, unknown>): Offer {
  return {
    key: String(row.key),
    label: String(row.label),
    description: row.description == null ? null : String(row.description),
    mode: row.mode === "subscription" ? "subscription" : "payment",
    interval: row.interval == null ? null : String(row.interval),
    priceCents: Number(row.price_cents),
    currency: String(row.currency ?? "brl"),
    stripePriceId: String(row.stripe_price_id),
    planType: String(row.plan_type),
    planLabel: String(row.plan_label ?? "free"),
    highlight: Boolean(row.highlight),
  };
}

export function mapCoupon(row: Record<string, unknown>): Coupon {
  return {
    code: String(row.code),
    stripeCouponId: String(row.stripe_coupon_id),
    offerKey: row.offer_key == null ? null : String(row.offer_key),
    affiliate: row.affiliate == null ? null : String(row.affiliate),
    discountCents: Number(row.discount_cents),
  };
}

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function loadOffer(admin: SupabaseClient, key: string): Promise<Offer | null> {
  return admin
    .from("stripe_offers")
    .select("*")
    .eq("key", key)
    .eq("active", true)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) throw new Error(`Falha ao ler a oferta: ${error.message}`);
      return data ? mapOffer(data as Record<string, unknown>) : null;
    });
}

export function loadCoupon(admin: SupabaseClient, code: string): Promise<Coupon | null> {
  return admin
    .from("stripe_coupons")
    .select("*")
    .eq("code", normalizeCouponCode(code))
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) throw new Error(`Falha ao ler o cupom: ${error.message}`);
      return data ? mapCoupon(data as Record<string, unknown>) : null;
    });
}

export type CouponCheck = {
  ok: boolean;
  reason: string;
  coupon: Coupon | null;
  discountCents: number;
  totalCents: number;
};

/** Server-side coupon check: the browser never decides the final price. */
export async function checkCoupon(
  admin: SupabaseClient,
  offer: Offer,
  rawCode: string,
): Promise<CouponCheck> {
  const code = normalizeCouponCode(rawCode);
  const base: CouponCheck = {
    ok: false,
    reason: "",
    coupon: null,
    discountCents: 0,
    totalCents: offer.priceCents,
  };
  if (!code) return { ...base, reason: "Informe um cupom." };

  const coupon = await loadCoupon(admin, code);
  if (!coupon) return { ...base, reason: "Cupom inválido ou não cadastrado." };

  const rows = await admin
    .from("stripe_coupons")
    .select("active, max_uses, used_count")
    .eq("code", coupon.code)
    .maybeSingle();
  const state = rows.data as Record<string, unknown> | null;
  if (!state) return { ...base, reason: "Cupom inválido ou não cadastrado." };
  if (state.active !== true) return { ...base, reason: "Este cupom está desativado." };

  const maxUses = state.max_uses == null ? null : Number(state.max_uses);
  const usedCount = Number(state.used_count ?? 0);
  if (maxUses !== null && usedCount >= maxUses) {
    return { ...base, reason: "Este cupom atingiu o limite de usos." };
  }

  if (coupon.offerKey && coupon.offerKey !== offer.key) {
    return { ...base, reason: "Este cupom não vale para a oferta escolhida." };
  }

  const discountCents = Math.min(coupon.discountCents, offer.priceCents);
  return {
    ok: true,
    reason: "",
    coupon,
    discountCents,
    totalCents: offer.priceCents - discountCents,
  };
}
