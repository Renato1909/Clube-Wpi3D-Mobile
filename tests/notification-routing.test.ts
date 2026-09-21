import {
  canHandleNotification,
  getNotificationRoute,
} from "../lib/notification-routing";

describe("notification routing", () => {
  test("waits for auth restoration before handling a notification", () => {
    expect(canHandleNotification(true, "user-123")).toBe(false);
    expect(canHandleNotification(false, undefined)).toBe(false);
    expect(canHandleNotification(false, null)).toBe(false);
    expect(canHandleNotification(false, "user-123")).toBe(true);
  });

  test("opens the affected quote for quote status notifications", () => {
    expect(
      getNotificationRoute({ quoteId: 42, status: "aprovado" }),
    ).toBe("/orcamentos/42");
  });

  test("accepts a string quote id from native notification payloads", () => {
    expect(
      getNotificationRoute({ quoteId: "42", status: "em_analise" }),
    ).toBe("/orcamentos/42");
  });

  test("ignores unrelated or malformed notification payloads", () => {
    expect(getNotificationRoute({ type: "new_customer" })).toBeNull();
    expect(getNotificationRoute({ quoteId: 0, status: "aprovado" })).toBeNull();
    expect(getNotificationRoute({ quoteId: 42 })).toBeNull();
    expect(getNotificationRoute({ quoteId: "999999999999999999999", status: "aprovado" })).toBeNull();
    expect(getNotificationRoute(null)).toBeNull();
  });
});
