import { createClient } from "@/lib/supabase/server";
import { rowToProduct } from "@/lib/utils/product-mapper";
import ProductsClient from "./products-client";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

// Server component: fetch the catalog from the database so the initial HTML
// contains real products (good for crawlers, link previews, and slow clients).
// No hardcoded fallback — prices must always come from the DB.
export default async function ProductsPage({ searchParams }: Props) {
  const { category } = await searchParams;

  let initialProducts: ReturnType<typeof rowToProduct>[] = [];
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
    // DB unreachable — the page will render with an empty catalog.
    // The client-side store will retry fetching when it mounts.
  }

  return <ProductsClient initialProducts={initialProducts} category={category ?? null} />;
}
