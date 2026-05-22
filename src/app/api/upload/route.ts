import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const path = `${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("models")
    .upload(path, file);

  if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 });

  // Record in uploads table
  await supabase.from("uploads").insert({
    user_id: user.id,
    file_name: file.name,
    file_size: file.size,
    file_format: file.name.split(".").pop()?.toUpperCase(),
    storage_path: path,
  });

  return Response.json({ path, fileName: file.name }, { status: 201 });
}
