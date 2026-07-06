import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";
import { s3Client } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

// Extract B2 storage path from finish text (e.g. "Matte [File: a1b2-model.stl]")
function extractStoragePath(finishText: string | null | undefined): string | null {
  if (!finishText) return null;
  const match = finishText.match(/\[File:\s*(.*?)\]/);
  return match ? match[1].trim() : null;
}

export async function POST(request: Request) {
  // Accept either an admin session OR the CLEANUP_SECRET token
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const isTokenValid =
    process.env.CLEANUP_SECRET && token === process.env.CLEANUP_SECRET;

  if (!isTokenValid) {
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const admin = createAdminClient();

  // ─── 1. CLEAN UP PENDING ORDERS (Older than 2 hours) ───
  const orderCutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  let deletedOrdersCount = 0;

  const { data: staleOrders, error: fetchError } = await admin
    .from("orders")
    .select("id")
    .eq("status", "pending")
    .lt("created_at", orderCutoff);

  if (fetchError) {
    console.error("Cleanup: failed to fetch stale orders:", fetchError.message);
  } else if (staleOrders && staleOrders.length > 0) {
    const staleIds = staleOrders.map((o) => o.id);
    
    // Delete items first due to FK constraints
    await admin.from("order_items").delete().in("order_id", staleIds);
    
    const { error: deleteError } = await admin
      .from("orders")
      .delete()
      .in("id", staleIds);

    if (deleteError) {
      console.error("Cleanup: failed to delete stale orders:", deleteError.message);
    } else {
      deletedOrdersCount = staleIds.length;
    }
  }

  // ─── 2. CLEAN UP ORPHANED UPLOADS (Uploaded > 24 hours ago, not linked to any order) ───
  let deletedUploadsCount = 0;
  const uploadCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    // Get all uploads older than 24 hours
    const { data: oldUploads, error: uploadsFetchError } = await admin
      .from("uploads")
      .select("storage_path")
      .lt("created_at", uploadCutoff);

    if (uploadsFetchError) {
      console.error("Cleanup: failed to fetch old uploads:", uploadsFetchError.message);
    } else if (oldUploads && oldUploads.length > 0) {
      // Get all active order items to see what is currently referenced
      const { data: orderItems, error: itemsFetchError } = await admin
        .from("order_items")
        .select("finish");

      if (itemsFetchError) {
        console.error("Cleanup: failed to fetch order items:", itemsFetchError.message);
      } else {
        const activePaths = new Set(
          (orderItems || [])
            .map((item) => extractStoragePath(item.finish))
            .filter((path): path is string => !!path)
        );

        // Filter out uploads that are in active paths
        const orphanedPaths = oldUploads
          .map((u) => u.storage_path)
          .filter((path) => !activePaths.has(path));

        if (orphanedPaths.length > 0) {
          // Delete from B2 in parallel
          await Promise.all(
            orphanedPaths.map((key) =>
              s3Client.send(
                new DeleteObjectCommand({
                  Bucket: process.env.B2_BUCKET_NAME,
                  Key: key,
                })
              )
            )
          );
          console.log(`Cleanup: deleted ${orphanedPaths.length} orphaned files from B2.`);

          // Delete from database
          const { error: dbDeleteError } = await admin
            .from("uploads")
            .delete()
            .in("storage_path", orphanedPaths);

          if (dbDeleteError) {
            console.error("Cleanup: failed to delete orphaned database rows:", dbDeleteError.message);
          } else {
            deletedUploadsCount = orphanedPaths.length;
          }
        }
      }
    }
  } catch (err: any) {
    console.error("Cleanup: error during upload cleanup:", err.message);
  }

  return Response.json({
    success: true,
    deletedOrdersCount,
    deletedUploadsCount,
  });
}

