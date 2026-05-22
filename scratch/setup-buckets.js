const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2] || '';
    if (val.length > 0 && val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("Setting up Supabase storage buckets...");

  // 1. Create 'models' bucket (private)
  console.log("Creating 'models' bucket...");
  const { data: modelsBucket, error: modelsError } = await supabase.storage.createBucket('models', {
    public: false,
    fileSizeLimit: 52428800 // 50MB
  });
  if (modelsError) {
    if (modelsError.message.includes('already exists')) {
      console.log("'models' bucket already exists.");
    } else {
      console.error("Error creating 'models' bucket:", modelsError);
    }
  } else {
    console.log("'models' bucket created successfully:", modelsBucket);
  }

  // 2. Create 'product-images' bucket (public)
  console.log("Creating 'product-images' bucket...");
  const { data: imgBucket, error: imgError } = await supabase.storage.createBucket('product-images', {
    public: true,
    fileSizeLimit: 5242880 // 5MB
  });
  if (imgError) {
    if (imgError.message.includes('already exists')) {
      console.log("'product-images' bucket already exists.");
    } else {
      console.error("Error creating 'product-images' bucket:", imgError);
    }
  } else {
    console.log("'product-images' bucket created successfully:", imgBucket);
  }

  // Verify buckets
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Error listing buckets:", listError);
  } else {
    console.log("Verification - current buckets:", JSON.stringify(buckets, null, 2));
  }
}

run();
