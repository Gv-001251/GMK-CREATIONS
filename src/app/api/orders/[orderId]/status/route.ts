import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";
import { safeParseRequest, updateStatusSchema } from "@/lib/validations";
// Shipped/delivered customer emails are currently disabled — only the order
// confirmation email (sent from the order/verify routes) is active. To
// re-enable them, restore the import below and the email block further down.
// import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/email";

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

  // Status-specific customer emails (shipped/delivered) are intentionally
  // disabled for now — only the order confirmation email is sent. Re-enable by
  // restoring the email import above and re-adding the send block here.

  // NOTE: Uploaded model files are intentionally NOT deleted here when an order
  // becomes delivered/cancelled. The files are retained so an admin can still
  // review or re-download them; they are only removed when explicitly deleted
  // from the Uploads page (deletion unlocks once the order is delivered or
  // cancelled).

  return Response.json({ success: true });
}
