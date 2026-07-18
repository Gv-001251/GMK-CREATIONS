import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const adminUser = await requireAdmin();
  if (!adminUser) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return Response.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const { orderIds } = body;

  if (!orderIds || !Array.isArray(orderIds)) {
    return Response.json({ error: "orderIds array is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    // Soft delete only: mark the orders as deleted instead of removing them.
    // The order rows, their items, and any associated custom 3D model files in
    // B2 storage are all retained so nothing is lost to an accidental deletion.
    // These orders are simply hidden from the admin list (see /api/orders/list).
    const { error: softDeleteError } = await admin
      .from("orders")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", orderIds);

    if (softDeleteError) {
      throw new Error(`Order deletion failed: ${softDeleteError.message}`);
    }

    return Response.json({ success: true, deletedCount: orderIds.length });
  } catch (err: any) {
    console.error("Failed to delete orders:", err.message);
    return Response.json(
      { error: `Failed to delete orders: ${err.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
