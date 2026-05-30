import { createClient, requireAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const supabase = await createClient();

  let query = supabase.from("products").select("*", { count: "exact" });
  if (category && category !== "all") query = query.eq("category", category);

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data, count });
}

export async function POST(request: Request) {
  // Only admin users can create products
  const adminUser = await requireAdmin();
  if (!adminUser) return Response.json({ error: "Forbidden" }, { status: 403 });

  const supabase = await createClient();
  const product = await request.json();

  const { data, error } = await supabase.from("products").insert(product).select().single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json(data, { status: 201 });
}
