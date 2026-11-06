import { describe, expect, it } from "vitest";
import {
  applyDiscount,
  formatBRL,
  installmentLabel,
  intervalLabel,
  isFounderPlan,
  normalizeCouponCode,
  planTitle,
} from "./billing";

describe("cupom e preço do checkout", () => {
  it("aplica o desconto de R$ 120,00 sobre o Lote Vitalício de R$ 499,90", () => {
    expect(applyDiscount(49990, 12000)).toBe(37990);
  });

  it("nunca deixa o preço final abaixo de zero", () => {
    expect(applyDiscount(2990, 12000)).toBe(0);
  });

  it("formata os valores em reais como o app mostra", () => {
    expect(formatBRL(49990)).toBe("R$ 499,90");
    expect(formatBRL(37990)).toBe("R$ 379,90");
    expect(formatBRL(2990)).toBe("R$ 29,90");
    expect(formatBRL(29700)).toBe("R$ 297,00");
  });

  it("mostra a parcela de até 12x sem arredondar para baixo", () => {
    expect(installmentLabel(37990)).toBe("12x de R$ 31,66");
  });

  it("aceita o cupom escrito com espaços e minúsculas", () => {
    expect(normalizeCouponCode("  black friday120 ")).toBe("BLACKFRIDAY120");
  });

  it("distingue o lote fundador dos planos recorrentes", () => {
    expect(isFounderPlan("lifetime_founder")).toBe(true);
    expect(isFounderPlan("monthly")).toBe(false);
    expect(planTitle("lifetime_founder")).toBe("Membro Fundador");
    expect(planTitle("yearly")).toBe("Plano Anual");
    expect(intervalLabel("month")).toBe("/mês");
    expect(intervalLabel("year")).toBe("/ano");
    expect(intervalLabel(null)).toBe("");
  });
});
