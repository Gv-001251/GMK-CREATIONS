import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_EXTENSIONS = new Set(["stl", "obj", "3mf", "step", "stp"]);
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Get filename from query parameter
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename") || "model.stl";

  // File extension validation
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return Response.json(
      { error: `Invalid file type. Allowed: ${[...ALLOWED_EXTENSIONS].join(", ")}` },
      { status: 400 }
    );
  }

  // Read raw request body as ArrayBuffer
  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await request.arrayBuffer();
  } catch (err) {
    console.error("Error reading request body:", err);
    return Response.json({ error: "Failed to read upload data." }, { status: 400 });
  }

  // File size validation
  if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
    return Response.json(
      { error: "File too large. Maximum size is 2GB." },
      { status: 400 }
    );
  }

  // Sanitize filename — keep only alphanumeric, dots, hyphens, underscores
  const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${user.id}/${Date.now()}-${sanitizedName}`;

  // Convert to Buffer for Supabase upload
  const fileBuffer = Buffer.from(arrayBuffer);

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from("models")
    .upload(path, fileBuffer, {
      contentType: "application/octet-stream",
    });

  if (uploadError) {
    console.error("File upload failed:", uploadError.message);
    return Response.json({ error: `File upload failed: ${uploadError.message}` }, { status: 500 });
  }

  // Record in uploads table
  const { error: insertError } = await supabase.from("uploads").insert({
    user_id: user.id,
    file_name: sanitizedName,
    file_size: arrayBuffer.byteLength,
    file_format: ext.toUpperCase(),
    storage_path: path,
  });

  if (insertError) {
    console.error("Failed to record upload:", insertError.message);
  }

  return Response.json({ path, fileName: sanitizedName }, { status: 201 });
}
