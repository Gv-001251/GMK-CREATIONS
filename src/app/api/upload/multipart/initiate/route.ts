import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { s3Client } from "@/lib/s3";
import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";

const ALLOWED_EXTENSIONS = new Set(["stl", "obj", "3mf", "step", "stp"]);
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

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

  const { filename, fileSize } = body;

  if (!filename) {
    return Response.json({ error: "Filename is required" }, { status: 400 });
  }

  // File extension validation
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return Response.json(
      { error: `Invalid file type. Allowed: ${[...ALLOWED_EXTENSIONS].join(", ")}` },
      { status: 400 }
    );
  }

  // File size validation
  if (fileSize && fileSize > MAX_FILE_SIZE) {
    return Response.json(
      { error: "File too large. Maximum size is 2GB." },
      { status: 400 }
    );
  }

  // Sanitize filename — keep only alphanumeric, dots, hyphens, underscores
  const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const hash = randomBytes(4).toString("hex"); // 8-char hex prefix for uniqueness
  const path = `${hash}-${sanitizedName}`;

  try {
    const command = new CreateMultipartUploadCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: path,
      ContentType: "application/octet-stream",
    });

    const response = await s3Client.send(command);
    
    return Response.json({
      uploadId: response.UploadId,
      key: path,
    });
  } catch (err: any) {
    console.error("Failed to initiate B2 multipart upload:", err.message);
    return Response.json(
      { error: `Failed to initiate multipart upload: ${err.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
