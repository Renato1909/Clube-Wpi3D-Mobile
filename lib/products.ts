import { supabase } from "./supabase";

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

const fallbackProducts: Product[] = [
  {
    slug: "peca-religiosa",
    title: "Peça religiosa",
    category: "Arte religiosa",
    image:
      "https://raw.githubusercontent.com/Renato1909/clube-wpi3d/main/public/produtos/produto-01.jpeg",
    description: "Peça de arte religiosa personalizada.",
    priceCents: null,
  },
  {
    slug: "peca-decorativa",
    title: "Peça decorativa",
    category: "Decoração",
    image:
      "https://raw.githubusercontent.com/Renato1909/clube-wpi3d/main/public/produtos/produto-02.jpeg",
    description: "Peça decorativa produzida em impressão 3D.",
    priceCents: null,
  },
  {
    slug: "estatua-personalizada",
    title: "Estátua personalizada",
    category: "Decoração",
    image:
      "https://raw.githubusercontent.com/Renato1909/clube-wpi3d/main/public/produtos/produto-03.jpeg",
    description: "Estátua personalizada produzida em impressão 3D.",
    priceCents: null,
  },
];

function imageUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;

  const base = process.env.EXPO_PUBLIC_SUPABASE_URL;
  return base
    ? `${base}/storage/v1/object/public/products/${path.replace(/^\/+/, "")}`
    : path;
}

function mapRow(row: ProductRow): Product {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    description: row.description,
    image: imageUrl(row.image_path),
    priceCents: row.price_cents,
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "slug,title,category,description,image_path,price_cents,active,sort_order",
    )
    .eq("active", true)
    .order("sort_order")
    .order("title");

  return error || !data || data.length === 0 ? fallbackProducts : data.map(mapRow);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "slug,title,category,description,image_path,price_cents,active,sort_order",
    )
    .eq("active", true)
    .eq("slug", slug)
    .maybeSingle();

  return !error && data
    ? mapRow(data)
    : fallbackProducts.find((product) => product.slug === slug);
}

export function filterProducts(
  products: Product[],
  query: string,
  category: string,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return products.filter(
    (product) =>
      (!normalizedQuery ||
        [product.title, product.category, product.description].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        )) &&
      (!category || product.category === category),
  );
}

export function formatPrice(cents: number | null) {
  return cents === null
    ? "Preço a definir"
    : (cents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
}
