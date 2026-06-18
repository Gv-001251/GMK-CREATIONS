import { createClient, requireAdmin } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products").select("*").eq("slug", slug).single();

  if (error) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Only admin users can update products
  const adminUser = await requireAdmin();
  if (!adminUser) return Response.json({ error: "Forbidden" }, { status: 403 });

  const supabase = await createClient();
  const updates = await request.json();

  const { data, error } = await supabase
    .from("products").update(updates).eq("slug", slug).select().single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Only admin users can delete products
  const adminUser = await requireAdmin();
  if (!adminUser) return Response.json({ error: "Forbidden" }, { status: 403 });

  const supabase = await createClient();

  // 1. Fetch product to find associated images
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("image, images")
    .eq("slug", slug)
    .single();

  if (fetchError || !product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  // 2. Extract image paths from public URLs
  const extractPathFromUrl = (url: string) => {
    if (!url) return null;
    const parts = url.split("/product-images/");
    return parts.length > 1 ? parts[1] : null;
  };

  const pathsToDelete: string[] = [];
  const primaryPath = extractPathFromUrl(product.image);
  if (primaryPath) pathsToDelete.push(primaryPath);

  if (Array.isArray(product.images)) {
    product.images.forEach((imgUrl: string) => {
      const path = extractPathFromUrl(imgUrl);
      if (path && !pathsToDelete.includes(path)) {
        pathsToDelete.push(path);
      }
    });
  }

  // 3. Delete files from Supabase storage
  if (pathsToDelete.length > 0) {
    const supabaseAdmin = createAdminClient();
    const { error: storageError } = await supabaseAdmin.storage
      .from("product-images")
      .remove(pathsToDelete);

    if (storageError) {
      console.error("Failed to delete product images from bucket:", storageError.message);
    }
  }

  // 4. Delete product from database
  const { error } = await supabase.from("products").delete().eq("slug", slug);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ success: true });
}
