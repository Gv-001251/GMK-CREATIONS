import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.B2_ENDPOINT;
const accessKeyId = process.env.B2_APPLICATION_KEY_ID;
const secretAccessKey = process.env.B2_APPLICATION_KEY;
const region = process.env.B2_REGION || "us-west-004";

if (!endpoint || !accessKeyId || !secretAccessKey) {
  console.warn("Backblaze B2 S3 credentials are not fully configured in environment variables.");
}

export const s3Client = new S3Client({
  endpoint: endpoint ? `https://${endpoint.replace(/^https?:\/\//, "")}` : undefined,
  region,
  credentials: {
    accessKeyId: accessKeyId || "dummy-key",
    secretAccessKey: secretAccessKey || "dummy-secret",
  },
  forcePathStyle: true,
});
