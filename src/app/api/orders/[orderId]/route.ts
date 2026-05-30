import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the order belongs to the user and is still 'pending'
  const { data: order } = await supabase
    .from("orders")
    .select("user_id, status")
    .eq("id", orderId)
    .single();

  if (!order || order.user_id !== user.id) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "pending") {
    return Response.json(
      { error: "Only pending orders can be deleted" },
      { status: 400 }
    );
  }

  // Delete the order items
  await supabase.from("order_items").delete().eq("order_id", orderId);
  
  // Delete the order
  const { error } = await supabase.from("orders").delete().eq("id", orderId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
