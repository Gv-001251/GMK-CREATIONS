import { createClient } from "@/lib/supabase/server";
import { s3Client } from "@/lib/s3";
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

  const { uploadId, partNumber, key } = body;

  if (!uploadId || !partNumber || !key) {
    return Response.json(
      { error: "uploadId, partNumber, and key are required" },
      { status: 400 }
    );
  }



  try {
    const command = new UploadPartCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      PartNumber: Number(partNumber),
    });

    // Parts should expire in 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return Response.json({ signedUrl });
  } catch (err: any) {
    console.error("Failed to generate signed URL for part:", err.message);
    return Response.json(
      { error: `Failed to sign upload part: ${err.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
