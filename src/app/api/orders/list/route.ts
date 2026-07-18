import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  // Only admin users can list all orders
  const adminUser = await requireAdmin();
  if (!adminUser) return Response.json({ error: "Forbidden" }, { status: 403 });

  // Use admin client to read all orders (bypasses RLS "own orders" restriction)
  const admin = createAdminClient();

  const { data: orders, error, count } = await admin
    .from("orders")
    .select("*", { count: "exact" })
    // Hide soft-deleted orders (they remain in the DB, just not shown here)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Fetch items for each order
  const orderIds = (orders || []).map((o: { id: string }) => o.id);
  const { data: items } = await admin
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);

  // Attach items to orders
  const ordersWithItems = (orders || []).map(
    (order: { id: string; [key: string]: unknown }) => ({
      ...order,
      items: (items || []).filter(
        (item: { order_id: string }) => item.order_id === order.id
      ),
    })
  );

  return Response.json({ data: ordersWithItems, count });
}
