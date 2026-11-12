function safeMessage(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return value
    .replace(/\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9_]+\b/g, "[REDACTED]")
    .replace(/\bwhsec_[A-Za-z0-9_]+\b/g, "[REDACTED]")
    .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]");
}

export function checkoutError(error: unknown) {
  const record = error && typeof error === "object" ? error as Record<string, unknown> : {};
  const raw = record.raw && typeof record.raw === "object" ? record.raw as Record<string, unknown> : {};
  const details = {
    message: safeMessage(raw.message) ?? safeMessage(record.message) ?? "Não foi possível iniciar o pagamento.",
    type: safeMessage(raw.type) ?? safeMessage(record.type),
    code: safeMessage(raw.code) ?? safeMessage(record.code),
    param: safeMessage(raw.param) ?? safeMessage(record.param),
    requestId: safeMessage(record.requestId),
    statusCode: typeof record.statusCode === "number" ? record.statusCode : undefined,
  };
  return { error: details.message, stripeError: details };
}