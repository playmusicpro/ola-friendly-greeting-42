import { describe, it, expect } from "vitest";
import { emailMatches } from "./ResetAllDataCard";
describe("Reset geral exige o e-mail da conta", () => {
  it("libera só com o e-mail exato", () => {
    expect(emailMatches("ana@x.com", "ana@x.com")).toBe(true);
    expect(emailMatches(" ANA@x.com ", "ana@x.com")).toBe(true);
    expect(emailMatches("ana@y.com", "ana@x.com")).toBe(false);
    expect(emailMatches("", "ana@x.com")).toBe(false);
    expect(emailMatches("ana@x.com", null)).toBe(false);
  });
});
