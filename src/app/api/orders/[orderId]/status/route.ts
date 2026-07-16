import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";
import { safeParseRequest, updateStatusSchema } from "@/lib/validations";
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/email";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  // Only admin users can update order status
  const adminUser = await requireAdmin();
  if (!adminUser) return Response.json({ error: "Forbidden" }, { status: 403 });

  const parsed = await safeParseRequest(request, updateStatusSchema);
  if (!parsed.success) return parsed.response;

  const { status } = parsed.data;

  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    console.error("Failed to update order status:", error.message);
    return Response.json({ error: "Failed to update status" }, { status: 500 });
  }

  // Send status-specific customer emails (non-fatal)
  try {
    const { data: order } = await admin
      .from("orders")
      .select("user_name, user_email")
      .eq("id", orderId)
      .single();

    if (order?.user_email) {
      if (status === "shipped") {
        await sendOrderShippedEmail({
          orderId,
          customerName: order.user_name || "Customer",
          customerEmail: order.user_email,
        });
      } else if (status === "delivered") {
        await sendOrderDeliveredEmail({
          orderId,
          customerName: order.user_name || "Customer",
          customerEmail: order.user_email,
        });
      }
    }
  } catch (emailErr) {
    console.error("Status email failed (non-fatal):", emailErr);
  }

  // NOTE: Uploaded model files are intentionally NOT deleted here when an order
  // becomes delivered/cancelled. The files are retained so an admin can still
  // review or re-download them; they are only removed when explicitly deleted
  // from the Uploads page (deletion unlocks once the order is delivered or
  // cancelled).

  return Response.json({ success: true });
}
