let mockResult: { data: unknown; error: unknown } = { data: [], error: null };
function mockQuery() {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(() => Promise.resolve(mockResult)),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(mockResult).then(resolve),
  };
}
jest.mock("../lib/supabase", () => ({ supabase: { from: jest.fn(() => mockQuery()) } }));

import { getProducts, getProductBySlug, resolveProductImage } from "../lib/products";

const row = {
  slug: "peca", title: "Peça", category: "Arte", description: "Peça real",
  image_path: "pecas/peça 01.jpeg", price_cents: null,
};

beforeEach(() => {
  mockResult = { data: [], error: null };
  process.env.EXPO_PUBLIC_SUPABASE_URL = "https://example.supabase.co/";
  delete process.env.EXPO_PUBLIC_SITE_URL;
});

test("reads real images from product-images and encodes object paths", async () => {
  mockResult.data = [row];
  const products = await getProducts();
  expect(products).toHaveLength(1);
  expect(products[0].image).toBe("https://example.supabase.co/storage/v1/object/public/product-images/pecas/pe%C3%A7a%2001.jpeg");
});

test("preserves HTTPS URLs and resolves legacy storefront paths only with configuration", () => {
  expect(resolveProductImage("https://cdn.example.com/image.jpeg")).toBe("https://cdn.example.com/image.jpeg");
  expect(resolveProductImage("/produtos/produto-01.jpeg")).toBe("/produtos/produto-01.jpeg");
  expect(() => resolveProductImage("/produtos/other.jpeg")).toThrow("EXPO_PUBLIC_SITE_URL");
  process.env.EXPO_PUBLIC_SITE_URL = "https://store.example.com/";
  expect(resolveProductImage("/produtos/produto-01.jpeg")).toBe("https://store.example.com/produtos/produto-01.jpeg");
  expect(() => resolveProductImage("//other.example.com/image")).toThrow();
  expect(() => resolveProductImage("../private/file")).toThrow();
});

test("does not substitute demo products for empty results or backend errors", async () => {
  await expect(getProducts()).resolves.toEqual([]);
  mockResult = { data: null, error: new Error("backend unavailable") };
  await expect(getProducts()).rejects.toThrow("backend unavailable");
  await expect(getProductBySlug("peca")).rejects.toThrow("backend unavailable");
});

test("returns absence only when the product lookup succeeds without a row", async () => {
  mockResult = { data: null, error: null };
  await expect(getProductBySlug("peca")).resolves.toBeUndefined();
});
