import { createClient } from "@/lib/supabase/server";

const ALLOWED_EXTENSIONS = new Set(["stl", "obj", "3mf", "step", "stp"]);
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File;
  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  // File size validation
  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: "File too large. Maximum size is 2GB." },
      { status: 400 }
    );
  }

  // File extension validation
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return Response.json(
      { error: `Invalid file type. Allowed: ${[...ALLOWED_EXTENSIONS].join(", ")}` },
      { status: 400 }
    );
  }

  // Sanitize filename — keep only alphanumeric, dots, hyphens, underscores
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${user.id}/${Date.now()}-${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from("models")
    .upload(path, file);

  if (uploadError) {
    console.error("File upload failed:", uploadError.message);
    return Response.json({ error: "File upload failed" }, { status: 500 });
  }

  // Record in uploads table
  const { error: insertError } = await supabase.from("uploads").insert({
    user_id: user.id,
    file_name: sanitizedName,
    file_size: file.size,
    file_format: ext.toUpperCase(),
    storage_path: path,
  });

  if (insertError) {
    console.error("Failed to record upload:", insertError.message);
  }

  return Response.json({ path, fileName: sanitizedName }, { status: 201 });
}
