import { formatCurrency } from "@/lib/calculations";

export type BillingOffer = {
  key: string;
  label: string;
  description: string | null;
  mode: "payment" | "subscription";
  interval: "month" | "year" | null;
  priceCents: number;
  currency: string;
  planType: string;
  highlight: boolean;
};

export type CouponPreview = {
  valid: boolean;
  couponCode?: string;
  affiliate?: string | null;
  discountCents: number;
  priceCents: number;
  totalCents: number;
  reason?: string;
};

/** Máximo de parcelas offered no Checkout para a oferta à vista. */
export const MAX_INSTALLMENTS = 12;

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

/** Reaproveita o formatador de moeda do app para o preço nunca divergir do resto da interface. */
export function formatBRL(cents: number): string {
  const value = (Number.isFinite(cents) ? cents : 0) / 100;
  return formatCurrency(value);
}

/** Valor final depois do desconto do cupom, nunca abaixo de zero. */
export function applyDiscount(priceCents: number, discountCents: number): number {
  const price = Number.isFinite(priceCents) ? priceCents : 0;
  const discount = Number.isFinite(discountCents) ? Math.max(0, discountCents) : 0;
  return Math.max(0, price - Math.min(discount, price));
}

/** "12x de R$ 31,66" — arredonda para cima para nunca prometer parcela menor que a real. */
export function installmentLabel(totalCents: number, installments = MAX_INSTALLMENTS): string {
  const total = Number.isFinite(totalCents) ? Math.max(0, totalCents) : 0;
  const each = Math.ceil(total / installments);
  return `${installments}x de ${formatBRL(each)}`;
}

export function intervalLabel(interval: BillingOffer["interval"]): string {
  if (interval === "month") return "/mês";
  if (interval === "year") return "/ano";
  return "";
}

export function isFounderPlan(planType: string | null | undefined): boolean {
  return planType === "lifetime_founder";
}

/** Rótulo amigável do plano comprado, usado na confirmação de membro. */
export function planTitle(planType: string | null | undefined): string {
  switch (planType) {
    case "lifetime_founder":
      return "Membro Fundador";
    case "yearly":
      return "Plano Anual";
    case "monthly":
      return "Plano Mensal";
    default:
      return "Membro Play Pro";
  }
}
