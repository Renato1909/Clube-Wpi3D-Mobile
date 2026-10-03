import { hasBundledProductImage, productImageSource } from "../lib/product-images";

test("ships only the three original storefront photos for known legacy paths", () => {
  for (const name of ["01", "02", "03"]) {
    const path = "/produtos/produto-" + name + ".jpeg";
    expect(hasBundledProductImage(path)).toBe(true);
    expect(productImageSource(path)).not.toEqual({ uri: path });
  }
  expect(hasBundledProductImage("/produtos/other.jpeg")).toBe(false);
  expect(hasBundledProductImage("toString")).toBe(false);
});

test("keeps real HTTPS catalog images remote", () => {
  const image = "https://cdn.example.com/real-product.jpeg";
  expect(productImageSource(image)).toEqual({ uri: image });
});
