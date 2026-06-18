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
    key: "vr_double_desk",
    filename: "vr-developer-double-desk.jpg",
    localPath: "/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/media__1781497313912.jpg",
  },
  {
    key: "prabhavali_held",
    filename: "prabhavali-archway-held.jpg",
    localPath: "/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/media__1781497313973.jpg",
  },
  {
    key: "vr_figurine_profile",
    filename: "vr-developer-figurine-profile.jpg",
    localPath: "/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/media__1781497314020.jpg",
  },
  {
    key: "vr_figurine_threequarter",
    filename: "vr-developer-figurine-threequarter.jpg",
    localPath: "/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/media__1781497314021.jpg",
  },
  {
    key: "prabhavali_main",
    filename: "prabhavali-archway-main.jpg",
    localPath: "/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/media__1781497314073.jpg",
  }
];

async function run() {
  try {
    console.log("Uploading images batch 3...");
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

    console.log("Uploaded URLs batch 3:", uploadedUrls);
  } catch (error) {
    console.error("Error in script:", error);
    process.exit(1);
  }
}

run();
