const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load env variables from .env.local manually
const envLocalPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envLocalPath)) {
  console.error(".env.local not found!");
  process.exit(1);
}

const envContent = fs.readFileSync(envLocalPath, 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const imagesToUpload = [
  {
    key: "ufo_green_1",
    filename: "ufo-lamp-green-1.jpg",
    localPath: "/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/media__1781496807255.jpg",
  },
  {
    key: "ufo_green_2",
    filename: "ufo-lamp-green-2.jpg",
    localPath: "/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/media__1781496807309.jpg",
  },
  {
    key: "vr_desk_main",
    filename: "vr-developer-desk-set.jpg",
    localPath: "/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/media__1781496807208.jpg",
  },
  {
    key: "vr_desk_angle",
    filename: "vr-developer-desk-angle.jpg",
    localPath: "/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/media__1781496807304.jpg",
  },
  {
    key: "robot_grey_main",
    filename: "miniature-robot-grey.jpg",
    localPath: "/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/media__1781496807353.jpg",
  }
];

async function run() {
  try {
    // Check storage bucket
    console.log("Checking storage buckets...");
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) throw bucketsError;

    const hasProductImagesBucket = buckets.some((b) => b.id === "product-images");
    if (!hasProductImagesBucket) {
      console.log("Creating public 'product-images' bucket...");
      const { error: createBucketError } = await supabase.storage.createBucket("product-images", {
        public: true,
      });
      if (createBucketError) throw createBucketError;
    }

    // Upload images
    const uploadedUrls = {};
    for (const img of imagesToUpload) {
      if (!fs.existsSync(img.localPath)) {
        throw new Error(`Image not found locally at: ${img.localPath}`);
      }

      console.log(`Uploading ${img.filename}...`);
      const fileBuffer = fs.readFileSync(img.localPath);
      const storagePath = `${Date.now()}-${img.filename}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(storagePath, fileBuffer, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(storagePath);

      uploadedUrls[img.key] = publicUrl;
      console.log(`Uploaded! Public URL: ${publicUrl}`);
    }

    console.log("Uploaded URLs:", uploadedUrls);
  } catch (error) {
    console.error("Error in script:", error);
    process.exit(1);
  }
}

run();
