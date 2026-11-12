type InvoiceSubscription = {
  subscription?: string | { id: string } | null;
  parent?: {
    subscription_details?: {
      subscription?: string | { id: string } | null;
    } | null;
  } | null;
};

export function invoiceSubscriptionId(invoice: InvoiceSubscription): string | null {
  const subscription = invoice.subscription ?? invoice.parent?.subscription_details?.subscription;
  return typeof subscription === "string" ? subscription : subscription?.id ?? null;
}

export function isPaidInvoiceEvent(type: string): boolean {
  return type === "invoice.payment_succeeded" || type === "invoice.paid";
}