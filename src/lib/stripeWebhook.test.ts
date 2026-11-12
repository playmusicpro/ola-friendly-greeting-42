import { describe, expect, it } from "vitest";
import { invoiceSubscriptionId, isPaidInvoiceEvent } from "../../supabase/functions/stripe-webhook/invoice";

describe("paid invoice processing", () => {
  it("accepts invoice.payment_succeeded", () => {
    expect(isPaidInvoiceEvent("invoice.payment_succeeded")).toBe(true);
    expect(isPaidInvoiceEvent("invoice.payment_failed")).toBe(false);
  });
  it("preserves invoice.paid support", () => {
    expect(isPaidInvoiceEvent("invoice.paid")).toBe(true);
  });
  it("resolves subscription IDs from current Stripe invoices", () => {
    expect(invoiceSubscriptionId({ parent: { subscription_details: { subscription: "sub_current" } } })).toBe("sub_current");
  });
  it("resolves legacy and expanded invoice subscriptions", () => {
    expect(invoiceSubscriptionId({ subscription: "sub_legacy" })).toBe("sub_legacy");
    expect(invoiceSubscriptionId({ parent: { subscription_details: { subscription: { id: "sub_expanded" } } } })).toBe("sub_expanded");
    expect(invoiceSubscriptionId({})).toBeNull();
  });
});