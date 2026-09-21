export function canHandleNotification(
  loading: boolean,
  userId: string | null | undefined,
) {
  return !loading && Boolean(userId);
}

export function getNotificationRoute(data: unknown): "/minha-conta" | null {
  if (!data || typeof data !== "object") return null;

  const payload = data as Record<string, unknown>;
  const quoteId = payload.quoteId;
  const status = payload.status;

  if (
    (typeof quoteId === "number" &&
      Number.isSafeInteger(quoteId) &&
      quoteId > 0) ||
    (typeof quoteId === "string" && /^\\d+$/.test(quoteId))
  ) {
    if (typeof status === "string" && status.length > 0) {
      return "/minha-conta";
    }
  }

  return null;
}
