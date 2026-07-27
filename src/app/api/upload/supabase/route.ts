import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Reference/quote-request files (images & PDFs) stored in Supabase Storage.
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "pdf"]);
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const BUCKET = "custom-uploads";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const { filename, fileSize } = body;
  if (!filename) {
    return Response.json({ error: "Filename is required" }, { status: 400 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return Response.json(
      { error: `Invalid file type. Allowed: ${[...ALLOWED_EXTENSIONS].join(", ")}` },
      { status: 400 }
    );
  }

  if (fileSize && fileSize > MAX_FILE_SIZE) {
    return Response.json(
      { error: "File too large. Maximum size for reference files is 25MB." },
      { status: 400 }
    );
  }

  // Store under the user's folder so the storage RLS policy is satisfied and
  // files are namespaced per customer.
  const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const hash = randomBytes(4).toString("hex");
  const path = `${user.id}/${hash}-${sanitizedName}`;

  const admin = createAdminClient();

  // Pre-authorize a direct client upload (avoids routing the file bytes through
  // the serverless function, which has a small request-body limit).
  const { data: signed, error: signError } = await admin.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (signError || !signed) {
    console.error("Failed to create Supabase signed upload URL:", signError?.message);
    return Response.json(
      { error: "Failed to prepare upload. Please try again." },
      { status: 500 }
    );
  }

  // Record the upload. If this fails we don't leave an orphan file because the
  // object hasn't been uploaded yet (the signed URL is simply left unused).
  const { error: insertError } = await supabase.from("uploads").insert({
    user_id: user.id,
    file_name: sanitizedName,
    file_size: fileSize || 0,
    file_format: ext.toUpperCase(),
    storage_path: path,
    storage_provider: "supabase",
  });

  if (insertError) {
    console.error("Failed to record Supabase upload:", insertError.message);
    return Response.json(
      { error: "Failed to record upload. Please try again." },
      { status: 500 }
    );
  }

  return Response.json(
    {
      bucket: BUCKET,
      path: signed.path,
      token: signed.token,
      signedUrl: signed.signedUrl,
    },
    { status: 200 }
  );
}
