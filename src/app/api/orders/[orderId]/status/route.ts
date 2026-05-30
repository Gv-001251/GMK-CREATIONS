import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";
import { safeParseRequest, updateStatusSchema } from "@/lib/validations";

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
  return Response.json({ success: true });
}
