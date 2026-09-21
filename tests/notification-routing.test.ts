import { getNotificationRoute } from "../lib/notification-routing";

describe("notification routing", () => {
  test("opens the account screen for quote status notifications", () => {
    expect(
      getNotificationRoute({ quoteId: 42, status: "aprovado" }),
    ).toBe("/minha-conta");
  });

  test("accepts a string quote id from native notification payloads", () => {
    expect(
      getNotificationRoute({ quoteId: "42", status: "em_analise" }),
    ).toBe("/minha-conta");
  });

  test("ignores unrelated or malformed notification payloads", () => {
    expect(getNotificationRoute({ type: "new_customer" })).toBeNull();
    expect(getNotificationRoute({ quoteId: 0, status: "aprovado" })).toBeNull();
    expect(getNotificationRoute({ quoteId: 42 })).toBeNull();
    expect(getNotificationRoute(null)).toBeNull();
  });
});
