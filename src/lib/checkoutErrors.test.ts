import { describe, expect, it } from "vitest";
import { checkoutError } from "../../supabase/functions/_shared/checkout-errors";

describe("checkout errors", () => {
  it("returns Stripe's exact safe price error and diagnostic fields", () => {
    const result = checkoutError({ raw: { message: "No such price: 'price_1UajgPRJsa1P41oY0143a5F4'", type: "invalid_request_error", code: "resource_missing", param: "line_items[0][price]" }, statusCode: 404, requestId: "req_example" });
    expect(result.error).toBe("No such price: 'price_1UajgPRJsa1P41oY0143a5F4'");
    expect(result.stripeError.code).toBe("resource_missing");
    expect(result.stripeError.statusCode).toBe(404);
  });
  it("excludes raw headers and redacts credentials", () => {
    const result = checkoutError({ message: "Invalid API Key provided: rk_live_FAKEFIXTURE", headers: { authorization: "hidden" }, raw: { secret: "hidden" } });
    expect(result.error).toBe("Invalid API Key provided: [REDACTED]");
    expect(JSON.stringify(result)).not.toContain("hidden");
  });
});