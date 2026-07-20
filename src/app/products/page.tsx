import { createClient } from "@/lib/supabase/server";
import { rowToProduct } from "@/lib/utils/product-mapper";
import { products as defaultProducts } from "@/lib/data/products";
import ProductsClient from "./products-client";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

// Server component: fetch the catalog on the server so the initial HTML
// contains real products (good for crawlers, link previews, and slow clients).
export default async function ProductsPage({ searchParams }: Props) {
  const { category } = await searchParams;

  let initialProducts = defaultProducts;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (data && data.length > 0) {
      initialProducts = data.map(rowToProduct);
    }
  } catch {
    // Fall back to the bundled catalog if the DB is unreachable at render time.
  }

  return <ProductsClient initialProducts={initialProducts} category={category ?? null} />;
}
