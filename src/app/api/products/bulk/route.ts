import { createClient, requireAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Only admin users can bulk insert products
  const adminUser = await requireAdmin();
  if (!adminUser) return Response.json({ error: "Forbidden" }, { status: 403 });

  const supabase = await createClient();
  const products = await request.json();

  if (!Array.isArray(products) || products.length === 0) {
    return Response.json({ error: "Invalid data format or empty array" }, { status: 400 });
  }

  // Sanitize and map the products array to ensure data integrity before insert
  const sanitizedProducts = products.map(p => ({
    name: p.name || "Unnamed Product",
    price: Number(p.price) || 0,
    category: p.category || "uncategorized",
    description: p.description || "",
    longDescription: p.longDescription || "",
    // Fallbacks for arrays stored as strings or handle string parsing
    materials: p.materials ? p.materials.split(',').map((s: string) => s.trim()) : ["Standard PLA"],
    finishes: p.finishes ? p.finishes.split(',').map((s: string) => s.trim()) : ["Matte"],
    dimensions: p.dimensions || "100mm x 100mm x 100mm",
    layerHeight: p.layerHeight || "0.2mm",
    infillDensity: p.infillDensity || "15%",
    recommendedApplication: p.recommendedApplication || "General",
    productionDays: Number(p.productionDays) || 5,
    badge: p.badge || null,
    isNew: p.isNew === "true" || p.isNew === true,
    image: p.image || "/images/products/organic-sculptures.png",
    images: p.images ? p.images.split(',').map((s: string) => s.trim()) : [],
  }));

  const { data, error } = await supabase.from("products").insert(sanitizedProducts).select();
  
  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  
  return Response.json({ success: true, count: data?.length || 0 }, { status: 201 });
}
