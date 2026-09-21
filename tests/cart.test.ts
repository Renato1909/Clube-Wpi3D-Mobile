import {
  addCartItem,
  cartTotalCents,
  normalizeCart,
  normalizeQuantity,
  removeCartItem,
} from "../lib/cart";

describe("cart", () => {
  const base = { slug: "a", title: "A", image: "x", priceCents: 1000 };

  test("limita quantidade", () => {
    expect(normalizeQuantity(0)).toBe(1);
    expect(normalizeQuantity(150)).toBe(99);
  });

  test("acumula item", () => {
    const a = addCartItem([], base, 2);
    expect(addCartItem(a, base, 3)[0].quantity).toBe(5);
  });

  test("remove e totaliza", () => {
    const a = addCartItem([], base, 2);
    expect(cartTotalCents(a)).toBe(2000);
    expect(removeCartItem(a, "a")).toHaveLength(0);
  });

  test("preço indefinido", () => {
    expect(cartTotalCents([{ ...base, priceCents: null, quantity: 1 }])).toBeNull();
  });

  test("descarta dados persistidos inválidos e normaliza duplicados", () => {
    expect(
      normalizeCart([
        base,
        { ...base, quantity: 4 },
        { slug: "../invalid", title: "bad", image: "x", priceCents: 1, quantity: 1 },
        { slug: "missing-fields", quantity: 2 },
        null,
      ]),
    ).toEqual([{ ...base, quantity: 6 }]);
  });

  test("normaliza preços inválidos para preço indefinido", () => {
    expect(
      normalizeCart([{ ...base, priceCents: -1, quantity: 1 }]),
    ).toEqual([{ ...base, priceCents: null, quantity: 1 }]);
  });
});
