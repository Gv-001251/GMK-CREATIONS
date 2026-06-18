import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Only admin users can request signed URLs
  const adminUser = await requireAdmin();
  if (!adminUser) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { path } = await request.json();
    if (!path) {
      return Response.json({ error: "Path parameter is required" }, { status: 400 });
    }

    // Use admin client which has service role token bypassing RLS
    const admin = createAdminClient();
    const { data, error } = await admin.storage.from("models").createSignedUrl(path, 3600); // 1 hour expiration

    if (error) {
      console.error("Error creating signed URL:", error.message);
      return Response.json({ error: "Failed to generate signed download link" }, { status: 500 });
    }

    return Response.json({ signedUrl: data.signedUrl });
  } catch (err) {
    console.error("Sign error:", err);
    return Response.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
