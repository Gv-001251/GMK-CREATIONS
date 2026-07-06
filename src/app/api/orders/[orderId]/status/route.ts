import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";
import { safeParseRequest, updateStatusSchema } from "@/lib/validations";
import { s3Client } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/email";

// Extract B2 storage path from finish text (e.g. "Matte [File: a1b2-model.stl]")
function extractStoragePath(finishText: string | null | undefined): string | null {
  if (!finishText) return null;
  const match = finishText.match(/\[File:\s*(.*?)\]/);
  return match ? match[1].trim() : null;
}

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

  // When an order is marked as delivered, clean up the custom 3D model files —
  // the print is done and the files are no longer needed in storage.
  if (status === "delivered") {
    try {
      const { data: orderItems, error: itemsError } = await admin
        .from("order_items")
        .select("finish")
        .eq("order_id", orderId);

      if (itemsError) {
        console.error("Delivery cleanup: failed to fetch order items:", itemsError.message);
      } else if (orderItems && orderItems.length > 0) {
        const b2Keys = orderItems
          .map((item) => extractStoragePath(item.finish))
          .filter((k): k is string => !!k);

        if (b2Keys.length > 0) {
          // Delete files from B2 in parallel
          await Promise.all(
            b2Keys.map((key) =>
              s3Client.send(
                new DeleteObjectCommand({
                  Bucket: process.env.B2_BUCKET_NAME,
                  Key: key,
                })
              )
            )
          );
          console.log(`Delivery cleanup: deleted ${b2Keys.length} B2 file(s) for order ${orderId}.`);

          // Remove matching rows from the uploads table
          const { error: uploadsDeleteError } = await admin
            .from("uploads")
            .delete()
            .in("storage_path", b2Keys);

          if (uploadsDeleteError) {
            console.error("Delivery cleanup: failed to remove upload records:", uploadsDeleteError.message);
          } else {
            console.log(`Delivery cleanup: removed ${b2Keys.length} upload record(s) for order ${orderId}.`);
          }
        }
      }
    } catch (cleanupErr: any) {
      // Non-fatal — status was already updated successfully
      console.error("Delivery cleanup error (non-fatal):", cleanupErr.message);
    }
  }

  return Response.json({ success: true });
}

