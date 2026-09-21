export type CartItem = {
  slug: string;
  title: string;
  image: string;
  priceCents: number | null;
  quantity: number;
};

export function normalizeQuantity(value: number) {
  return Math.max(1, Math.min(99, Math.trunc(value)));
}

export function normalizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  const merged = new Map<string, CartItem>();

  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") continue;

    const item = candidate as Record<string, unknown>;
    const slug = typeof item.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)
      ? item.slug
      : null;
    const title = typeof item.title === "string" ? item.title.trim() : "";
    const image = typeof item.image === "string" ? item.image.trim() : "";
    const priceCents =
      item.priceCents === null
        ? null
        : typeof item.priceCents === "number" && Number.isSafeInteger(item.priceCents) && item.priceCents >= 0
          ? item.priceCents
          : null;
    const quantity =
      typeof item.quantity === "number" && Number.isFinite(item.quantity)
        ? normalizeQuantity(item.quantity)
        : null;

    if (!slug || !title || !image || quantity === null) continue;

    const existing = merged.get(slug);
    if (!existing) {
      merged.set(slug, { slug, title, image, priceCents, quantity });
      continue;
    }

    existing.quantity = normalizeQuantity(existing.quantity + quantity);
  }

  return [...merged.values()];
}

export function addCartItem(
  items: CartItem[],
  item: Omit<CartItem, "quantity">,
  quantity = 1,
) {
  const q = normalizeQuantity(quantity);
  const found = items.find((x) => x.slug === item.slug);
  if (!found) return [...items, { ...item, quantity: q }];
  return items.map((x) =>
    x.slug === item.slug
      ? { ...x, quantity: normalizeQuantity(x.quantity + q) }
      : x,
  );
}

export function removeCartItem(items: CartItem[], slug: string) {
  return items.filter((x) => x.slug !== slug);
}

export function cartTotalCents(items: CartItem[]) {
  return items.some((x) => x.priceCents === null)
    ? null
    : items.reduce((s, x) => s + (x.priceCents as number) * x.quantity, 0);
}
