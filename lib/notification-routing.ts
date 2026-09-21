export function canHandleNotification(
  loading: boolean,
  userId: string | null | undefined,
) {
  return !loading && Boolean(userId);
}

export function getNotificationRoute(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const payload = data as Record<string, unknown>;
  const quoteId = payload.quoteId;
  const status = payload.status;

  let normalizedQuoteId: string | null = null;

  if (
    typeof quoteId === "number" &&
    Number.isSafeInteger(quoteId) &&
    quoteId > 0
  ) {
    normalizedQuoteId = String(quoteId);
  } else if (
    typeof quoteId === "string" &&
    /^\d+$/.test(quoteId) &&
    Number.isSafeInteger(Number(quoteId)) &&
    Number(quoteId) > 0
  ) {
    normalizedQuoteId = quoteId;
  }

  if (
    normalizedQuoteId &&
    typeof status === "string" &&
    status.length > 0
  ) {
    return `/orcamentos/${normalizedQuoteId}`;
  }

  return null;
}
