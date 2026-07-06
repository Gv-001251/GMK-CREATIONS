import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";
import { s3Client } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

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

  const { ids, keys } = body;

  if (!ids || !Array.isArray(ids) || !keys || !Array.isArray(keys)) {
    return Response.json(
      { error: "ids and keys arrays are required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  try {
    // 1. Delete files from Backblaze B2 individually
    // NOTE: B2 does not support the S3 DeleteObjects (bulk) API.
    // We must issue one DeleteObjectCommand per file and run them in parallel.
    if (keys.length > 0) {
      console.log(`Deleting ${keys.length} files from B2 bucket...`);
      await Promise.all(
        keys.map((key) =>
          s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.B2_BUCKET_NAME,
              Key: key,
            })
          )
        )
      );
    }

    // 2. Delete database records in Supabase
    if (ids.length > 0) {
      console.log(`Deleting ${ids.length} database records from uploads...`);
      const { error: dbError } = await admin
        .from("uploads")
        .delete()
        .in("id", ids);

      if (dbError) {
        throw new Error(`Database deletion failed: ${dbError.message}`);
      }
    }

    return Response.json({ success: true, deletedCount: ids.length });
  } catch (err: any) {
    console.error("Failed to delete uploads:", err.message);
    return Response.json(
      { error: `Failed to delete uploads: ${err.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
