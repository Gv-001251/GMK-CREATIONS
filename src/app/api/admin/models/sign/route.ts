import { requireAdmin } from "@/lib/supabase/server";
import { s3Client } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

    let signedUrl: string;
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: path,
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
