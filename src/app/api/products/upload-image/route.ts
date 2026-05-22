import { requireAdmin } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  // Only admins can upload product images
  const adminUser = await requireAdmin();
  if (!adminUser) return Response.json({ error: "Forbidden" }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  // Make sure it is an image
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();
  // Sanitize filename to avoid weird character issues
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${Date.now()}-${sanitizedName}`;

  // Upload to public "product-images" bucket
  const { error: uploadError } = await supabaseAdmin.storage
    .from("product-images")
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 });
  }

  // Get the public URL for the uploaded image
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("product-images")
    .getPublicUrl(path);

  return Response.json({ url: publicUrl, path }, { status: 201 });
}

