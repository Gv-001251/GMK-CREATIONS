import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";
import { s3Client } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

// Helper to extract file path from finish text
function extractStoragePath(finishText: string | null | undefined): string | null {
  if (!finishText) return null;
  const match = finishText.match(/\[File:\s*(.*?)\]/);
  return match ? match[1].trim() : null;
}

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
    // 1. Find all associated custom 3D model files from the orders we are deleting
    const { data: orderItems, error: itemsError } = await admin
      .from("order_items")
      .select("finish")
      .in("order_id", orderIds);

    if (itemsError) {
      console.error("Failed to query order items for B2 cleanup:", itemsError.message);
    } else if (orderItems && orderItems.length > 0) {
      // Extract B2 keys from finish text (e.g. "Matte [File: a1b2c3-model.stl]")
      const b2Keys = orderItems
        .map((item) => extractStoragePath(item.finish))
        .filter((k): k is string => !!k);

      if (b2Keys.length > 0) {
        // 1a. Delete files from B2 (one-by-one — B2 does not support DeleteObjects bulk API)
        console.log(`Cleaning up B2: Deleting ${b2Keys.length} files...`);
        try {
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
          console.log("B2 cleanup complete.");
        } catch (s3Err: any) {
          // Don't halt order deletion if B2 delete fails (file may already be gone)
          console.error("B2 file cleanup failed during order deletion:", s3Err.message);
        }

        // 1b. Delete matching rows from the uploads table so the admin uploads
        //     page stays in sync without requiring a separate manual cleanup.
        console.log(`Removing ${b2Keys.length} upload records from DB...`);
        const { error: uploadsDeleteError } = await admin
          .from("uploads")
          .delete()
          .in("storage_path", b2Keys);

        if (uploadsDeleteError) {
          // Non-fatal: log but continue — the file is already gone from B2
          console.error("Failed to remove upload records:", uploadsDeleteError.message);
        }
      }
    }

    // 2. Delete database records in Supabase (order items first to respect foreign key constraints)
    console.log(`Deleting items for ${orderIds.length} orders...`);
    const { error: itemsDeleteError } = await admin
      .from("order_items")
      .delete()
      .in("order_id", orderIds);

    if (itemsDeleteError) {
      throw new Error(`Order items deletion failed: ${itemsDeleteError.message}`);
    }

    console.log(`Deleting ${orderIds.length} orders...`);
    const { error: ordersDeleteError } = await admin
      .from("orders")
      .delete()
      .in("id", orderIds);

    if (ordersDeleteError) {
      throw new Error(`Orders deletion failed: ${ordersDeleteError.message}`);
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
