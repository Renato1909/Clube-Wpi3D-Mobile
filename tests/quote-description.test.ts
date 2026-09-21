import { buildQuoteDescription } from "../lib/quote-description";

describe("quote description", () => {
  test("keeps a direct quote description unchanged when the cart is empty", () => {
    expect(buildQuoteDescription("  Quero uma peça  ", [])).toBe(
      "Quero uma peça",
    );
  });

  test("adds cart items and quantities to the quote", () => {
    const result = buildQuoteDescription("Quero orçamento", [
      {
        slug: "cubo",
        title: "Cubo personalizado",
        image: "https://example.com/cubo.png",
        priceCents: 1250,
        quantity: 2,
      },
      {
        slug: "suporte",
        title: "Suporte",
        image: "https://example.com/suporte.png",
        priceCents: null,
        quantity: 1,
      },
    ]);

    expect(result).toContain("Quero orçamento");
    expect(result).toContain("Itens selecionados no carrinho:");
    expect(result).toContain("2x Cubo personalizado");
    expect(result).toContain("1x Suporte");
    expect(result).toContain("R$");
    expect(result).toContain("preço a definir");
  });
});
