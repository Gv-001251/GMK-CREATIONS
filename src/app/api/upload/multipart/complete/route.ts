import { createClient } from "@/lib/supabase/server";
import { s3Client } from "@/lib/s3";
import { CompleteMultipartUploadCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return Response.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const { uploadId, key, filename, fileSize, parts } = body;

  if (!uploadId || !key || !filename || !parts || !Array.isArray(parts)) {
    return Response.json(
      { error: "uploadId, key, filename, and parts array are required" },
      { status: 400 }
    );
  }



  try {
    // Sort parts by PartNumber (S3 requires parts to be in ascending order of part numbers!)
    const sortedParts = [...parts].sort((a, b) => a.PartNumber - b.PartNumber);

    const command = new CompleteMultipartUploadCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: sortedParts.map((p) => ({
          ETag: p.ETag,
          PartNumber: Number(p.PartNumber),
        })),
      },
    });

    const response = await s3Client.send(command);

    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");

    // Record in uploads table
    const { error: insertError } = await supabase.from("uploads").insert({
      user_id: user.id,
      file_name: sanitizedName,
      file_size: fileSize || 0,
      file_format: ext.toUpperCase(),
      storage_path: key,
    });

    if (insertError) {
      console.error("Database insert failed for upload, cleaning up B2 file:", insertError.message);
      // Rollback: delete the just-completed file from B2 to prevent orphans
      try {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.B2_BUCKET_NAME,
          Key: key,
        }));
      } catch (cleanupErr: any) {
        console.error("B2 cleanup after failed DB insert also failed:", cleanupErr.message);
      }
      return Response.json(
        { error: "Failed to record upload. Please try again." },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      path: key,
      location: response.Location,
    });
  } catch (err: any) {
    console.error("Failed to complete B2 multipart upload:", err.message);
    return Response.json(
      { error: `Failed to complete multipart upload: ${err.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
