import type { ImageSourcePropType } from "react-native";

// Original storefront photos bundled with the app, not demo catalog entries.
const bundledPhotos: Record<string, ImageSourcePropType> = {
  "/produtos/produto-01.jpeg": require("../assets/products/produto-01.jpeg"),
  "/produtos/produto-02.jpeg": require("../assets/products/produto-02.jpeg"),
  "/produtos/produto-03.jpeg": require("../assets/products/produto-03.jpeg"),
};

export function hasBundledProductImage(path: string) {
  return Object.prototype.hasOwnProperty.call(bundledPhotos, path);
}

export function productImageSource(image: string): ImageSourcePropType {
  return hasBundledProductImage(image) ? bundledPhotos[image] : { uri: image };
}
