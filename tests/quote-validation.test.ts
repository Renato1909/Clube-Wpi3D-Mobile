import {
  QUOTE_DESCRIPTION_MAX_LENGTH,
  QUOTE_DESCRIPTION_MIN_LENGTH,
  validateQuoteDescription,
} from "../lib/quote-validation";

describe("quote validation", () => {
  test("accepts a valid description", () => {
    expect(validateQuoteDescription("Peça para suporte de celular")).toBeNull();
  });

  test("rejects descriptions shorter than the database minimum", () => {
    expect(validateQuoteDescription("curto")).toContain("10");
    expect(QUOTE_DESCRIPTION_MIN_LENGTH).toBe(10);
  });

  test("rejects descriptions longer than the database maximum", () => {
    expect(
      validateQuoteDescription("x".repeat(QUOTE_DESCRIPTION_MAX_LENGTH + 1)),
    ).toContain("5000");
  });
});
