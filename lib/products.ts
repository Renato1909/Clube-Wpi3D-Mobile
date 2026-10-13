import { supabase } from "./supabase";
import { hasBundledProductImage } from "./product-images";

export type Product = {
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  priceCents: number | null;
};
type ProductRow = Omit<Product, "image" | "priceCents"> & {
  image_path: string;
  price_cents: number | null;
  active?: boolean;
  sort_order?: number;
};

export function resolveProductImage(path: string) {
  if (/^https:\/\//i.test(path)) return path;
  if (/^http:\/\//i.test(path) || path.startsWith("//")) {
    throw new Error("A imagem do produto precisa usar HTTPS.");
  }

  // Older catalog entries refer to files hosted by the web storefront.
  if (path.startsWith("/produtos/")) {
    const site = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/+$/, "");
    if (!site && hasBundledProductImage(path)) return path;
    if (!site || !/^https:\/\//i.test(site)) {
      throw new Error("Configure EXPO_PUBLIC_SITE_URL ou migre as fotos para product-images.");
    }
    return site + path;
  }

  const base = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  if (!base) throw new Error("Configure EXPO_PUBLIC_SUPABASE_URL.");
  const objectPath = path.replace(/^\/+/, "");
  if (!objectPath || objectPath.split("/").some((part) => part === ".." || part === ".")) {
    throw new Error("Caminho de imagem inválido.");
  }
  return base + "/storage/v1/object/public/product-images/" +
    objectPath.split("/").map(encodeURIComponent).join("/");
}

function mapRow(row: ProductRow): Product {
  return {
    slug: row.slug, title: row.title, category: row.category,
    description: row.description, image: resolveProductImage(row.image_path),
    priceCents: row.price_cents,
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products")
    .select("slug,title,category,description,image_path,price_cents,active,sort_order")
    .eq("active", true).order("sort_order").order("title");
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { data, error } = await supabase.from("products")
    .select("slug,title,category,description,image_path,price_cents,active,sort_order")
    .eq("active", true).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : undefined;
}

export function filterProducts(products: Product[], query: string, category: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return products.filter((product) =>
    (!normalizedQuery || [product.title, product.category, product.description]
      .some((value) => value.toLocaleLowerCase().includes(normalizedQuery))) &&
    (!category || product.category === category));
}

export function formatPrice(cents: number | null) {
  return cents === null ? "Preço a definir" :
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

