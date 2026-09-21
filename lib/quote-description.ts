import type { CartItem } from "./cart";

export function buildQuoteDescription(description: string, items: CartItem[]) {
  const text = description.trim();
  if (!items.length) return text;

  const lines = items.map((item) => {
    const price =
      item.priceCents === null
        ? "preço a definir"
        : `${(item.priceCents / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })} cada`;

    return `- ${item.quantity}x ${item.title} (${price})`;
  });

  return `${text}\n\nItens selecionados no carrinho:\n${lines.join("\n")}`;
}
