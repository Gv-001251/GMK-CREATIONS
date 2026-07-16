import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";
import { s3Client } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

// Orders in these statuses are still being fulfilled, so their uploaded model
// files must not be deletable. A file becomes deletable only once its order is
// "delivered" or "cancelled" (or if it isn't attached to any order at all).
const ACTIVE_ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped"];

export async function POST(request: Request) {
  const adminUser = await requireAdmin();
  if (!adminUser) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const { ids, keys } = body;

  if (!ids || !Array.isArray(ids) || !keys || !Array.isArray(keys)) {
    return Response.json(
      { error: "ids and keys arrays are required" },
      { status: 400 }
    );
  }

  // ids and keys are aligned by index (ids[i] owns the object at keys[i]),
  // matching how the admin UI builds the payload.
  if (ids.length !== keys.length) {
    return Response.json(
      { error: "ids and keys arrays must be the same length" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // ── Enforce order-status lock ──────────────────────────────────────────────
  // A file that belongs to an order still being fulfilled cannot be deleted.
  const lockedKeys = new Set<string>();
  try {
    const { data: fileItems } = await admin
      .from("order_items")
      .select("finish, order_id")
      .ilike("finish", "%[File:%");

    // Map each storage path referenced in an order to the owning order ids.
    const pathToOrderIds = new Map<string, Set<string>>();
    (fileItems || []).forEach((it: { finish: string | null; order_id: string | null }) => {
      const m = (it.finish || "").match(/\[File:\s*(.*?)\]/);
      if (m && it.order_id) {
        const p = m[1].trim();
        if (!pathToOrderIds.has(p)) pathToOrderIds.set(p, new Set());
        pathToOrderIds.get(p)!.add(it.order_id);
      }
    });

    const relevantKeys = keys.filter((k: string) => pathToOrderIds.has(k));
    if (relevantKeys.length > 0) {
      const orderIds = Array.from(
        new Set(relevantKeys.flatMap((k: string) => [...(pathToOrderIds.get(k) || [])]))
      );
      const { data: ords } = await admin
        .from("orders")
        .select("id, status")
        .in("id", orderIds);

      const statusById = new Map<string, string>();
      (ords || []).forEach((o: { id: string; status: string }) => statusById.set(o.id, o.status));

      for (const k of relevantKeys) {
        for (const oid of pathToOrderIds.get(k) || []) {
          const status = statusById.get(oid);
          if (status && ACTIVE_ORDER_STATUSES.includes(status)) {
            lockedKeys.add(k);
            break;
          }
        }
      }
    }
  } catch (lockErr) {
    console.error("Failed to evaluate upload lock status:", lockErr);
    // Fail safe: if lock status can't be determined, don't delete anything.
    return Response.json(
      { error: "Could not verify order status for these files. Please try again." },
      { status: 500 }
    );
  }

  // Partition the request into files we may delete vs files locked by an order.
  const deletable: { id: unknown; key: string }[] = [];
  const blockedKeys: string[] = [];
  for (let i = 0; i < keys.length; i++) {
    if (lockedKeys.has(keys[i])) blockedKeys.push(keys[i]);
    else deletable.push({ id: ids[i], key: keys[i] });
  }

  // Nothing can be deleted — every requested file is tied to an active order.
  if (deletable.length === 0) {
    return Response.json(
      {
        success: false,
        deletedCount: 0,
        blockedCount: blockedKeys.length,
        error:
          "These files belong to active orders. They can only be deleted once the order is delivered or cancelled.",
      },
      { status: 409 }
    );
  }

  try {
    // Delete files from Backblaze B2 individually. B2 has no bulk-delete API, so
    // we issue one DeleteObjectCommand per file and use allSettled so a single
    // failure doesn't abort the batch — DB rows are removed only for files that
    // were actually deleted, keeping B2 and the DB in sync.
    const deletedIds: unknown[] = [];
    const failures: { key: string; reason: string }[] = [];

    console.log(`Deleting ${deletable.length} files from B2 bucket...`);
    const results = await Promise.allSettled(
      deletable.map(({ key }) =>
        s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME,
            Key: key,
          })
        )
      )
    );

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        deletedIds.push(deletable[i].id);
      } else {
        const reason =
          result.reason instanceof Error ? result.reason.message : String(result.reason);
        console.error(`Failed to delete B2 object "${deletable[i].key}":`, reason);
        failures.push({ key: deletable[i].key, reason });
      }
    });

    // Delete DB records only for files successfully removed from B2.
    if (deletedIds.length > 0) {
      console.log(`Deleting ${deletedIds.length} database records from uploads...`);
      const { error: dbError } = await admin
        .from("uploads")
        .delete()
        .in("id", deletedIds);

      if (dbError) {
        throw new Error(`Database deletion failed: ${dbError.message}`);
      }
    }

    // Report a partial result when some files were blocked by an order or
    // failed to delete from storage.
    if (blockedKeys.length > 0 || failures.length > 0) {
      const parts: string[] = [];
      if (blockedKeys.length > 0) {
        parts.push(
          `${blockedKeys.length} file(s) belong to active orders and were kept (deletable once delivered or cancelled)`
        );
      }
      if (failures.length > 0) {
        parts.push(`${failures.length} file(s) could not be removed from storage`);
      }
      return Response.json(
        {
          success: false,
          deletedCount: deletedIds.length,
          blockedCount: blockedKeys.length,
          failedCount: failures.length,
          failures,
          error: parts.join("; ") + ".",
        },
        { status: 207 }
      );
    }

    return Response.json({ success: true, deletedCount: deletedIds.length });
  } catch (err: any) {
    console.error("Failed to delete uploads:", err.message);
    return Response.json(
      { error: `Failed to delete uploads: ${err.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
