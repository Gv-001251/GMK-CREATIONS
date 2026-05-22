import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";
import { products } from "@/lib/data/products";

export async function POST() {
  // Only admin users can seed products
  const adminUser = await requireAdmin();
  if (!adminUser) return Response.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createAdminClient();

  // Transform camelCase to snake_case for Supabase
  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    long_description: p.longDescription,
    price: p.price,
    price_label: p.priceLabel || null,
    category: p.category,
    image: p.image,
    images: p.images,
    badge: p.badge || null,
    materials: p.materials,
    finishes: p.finishes,
    dimensions: p.dimensions,
    layer_height: p.layerHeight,
    infill_density: p.infillDensity,
    recommended_application: p.recommendedApplication,
    production_days: p.productionDays,
    featured: p.featured || false,
    is_new: p.isNew || false,
  }));

  const { data, error } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "id" })
    .select();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({
    message: `Seeded ${data.length} products successfully`,
    count: data.length,
  });
}
