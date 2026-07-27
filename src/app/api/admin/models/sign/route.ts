import { requireAdmin } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { s3Client } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Reference/quote-request files (image/PDF) are stored in this Supabase bucket;
// 3D model files (.stl/.obj/...) are stored in Backblaze B2.
const SUPABASE_BUCKET = "custom-uploads";

export async function POST(request: Request) {
  // Only admin users can request signed URLs
  const adminUser = await requireAdmin();
  if (!adminUser) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { path, provider } = await request.json();
    if (!path) {
      return Response.json({ error: "Path parameter is required" }, { status: 400 });
    }

    // Supabase-hosted reference files: sign via the Storage API.
    if (provider === "supabase") {
      const admin = createAdminClient();
      const { data, error } = await admin.storage
        .from(SUPABASE_BUCKET)
        .createSignedUrl(path, 3600, { download: true });

      if (error || !data) {
        console.error("Error creating Supabase signed download URL:", error?.message);
        return Response.json({ error: "Failed to generate signed download link" }, { status: 500 });
      }
      return Response.json({ signedUrl: data.signedUrl });
    }

    // Default: Backblaze B2-hosted 3D model files.
    let signedUrl: string;
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: path,
        ResponseContentDisposition: "attachment",
      });
      signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (err: any) {
      console.error("Error creating B2 presigned download URL:", err.message);
      return Response.json({ error: "Failed to generate signed download link" }, { status: 500 });
    }

    return Response.json({ signedUrl });
  } catch (err) {
    console.error("Sign error:", err);
    return Response.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
