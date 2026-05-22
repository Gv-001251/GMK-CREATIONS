import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";

export async function GET() {
  // Only admin users can list all orders
  const adminUser = await requireAdmin();
  if (!adminUser) return Response.json({ error: "Forbidden" }, { status: 403 });

  // Use admin client to read all orders (bypasses RLS "own orders" restriction)
  const admin = createAdminClient();

  const { data: orders, error } = await admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

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

  return Response.json(ordersWithItems);
}
