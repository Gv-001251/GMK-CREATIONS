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

async function uploadImage(localFileName) {
  const localFilePath = path.join(__dirname, '..', 'public', 'images', 'products', localFileName);
  if (!fs.existsSync(localFilePath)) {
    console.error(`File not found: ${localFilePath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(localFilePath);
  const targetPath = `${Date.now()}-${localFileName}`;

  console.log(`Uploading ${localFileName} to bucket 'product-images'...`);
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(targetPath, fileBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    console.error(`Upload error for ${localFileName}:`, error.message);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(targetPath);

  console.log(`Successfully uploaded ${localFileName}. Public URL: ${publicUrl}`);
  return publicUrl;
}

async function run() {
  console.log("Starting premium 3D items seeding...");

  // Upload images for Product 1 (Bio Chess Set)
  const chessUrl1 = await uploadImage('bio-chess.png');
  const chessUrl2 = await uploadImage('organic-sculptures.png');
  const chessUrl3 = await uploadImage('vortex-vase.png');

  // Upload images for Product 2 (Cyber Panda)
  const pandaUrl1 = await uploadImage('cyber-panda.png');
  const pandaUrl2 = await uploadImage('draco-keycaps.png');
  const pandaUrl3 = await uploadImage('honeycomb-pendant.png');

  if (!chessUrl1 || !pandaUrl1) {
    console.error("Critical image uploads failed. Aborting database seeding.");
    process.exit(1);
  }

  const newProducts = [
    {
      id: "mech-chess-set",
      name: "Mech Chess Collector Set",
      slug: "mech-chess-set",
      description: "Ultimate bio-mechanical chess set.",
      long_description: "A complete tournament-grade chess set with ornate, bio-mechanical pieces inspired by Giger. Individually printed in 8K resolution dark resin and finished in antique bronze and bone white. Includes custom board and protective container.",
      price: 185.00,
      price_label: "Premium Set",
      category: "decor",
      image: chessUrl1,
      images: [chessUrl1, chessUrl2, chessUrl3].filter(Boolean),
      badge: "Limited",
      materials: ["Resin (8K)", "Standard PLA"],
      finishes: ["Dark Metallic", "Bone White", "Antique Bronze"],
      dimensions: "Board: 400mm x 400mm, King: 95mm",
      layer_height: "0.025mm (25 Microns)",
      infill_density: "100% Solid",
      recommended_application: "Display / Gaming",
      production_days: 8,
      featured: true,
      is_new: true
    },
    {
      id: "cyber-panda-2099",
      name: "Cyber-Panda 2099 Edition",
      slug: "cyber-panda-2099",
      description: "Futuristic display sculpture.",
      long_description: "A futuristic display model featuring a cybernetic panda in advanced tactical armor. Exquisitely detailed geometric patterns printed in high-definition resin with high-strength carbon fiber PETG reinforcements. Complete with glowing highlight finishes.",
      price: 95.00,
      price_label: "Special Edition",
      category: "miniatures",
      image: pandaUrl1,
      images: [pandaUrl1, pandaUrl2, pandaUrl3].filter(Boolean),
      badge: "Hot",
      materials: ["Resin (8K)", "Carbon Fiber PETG"],
      finishes: ["Matte", "Satin", "Gloss"],
      dimensions: "90mm x 70mm x 110mm",
      layer_height: "0.025mm (25 Microns)",
      infill_density: "100% Solid",
      recommended_application: "Display / Collection",
      production_days: 5,
      featured: true,
      is_new: true
    }
  ];

  console.log("Upserting premium products into Supabase database...");
  const { data, error } = await supabase
    .from('products')
    .upsert(newProducts, { onConflict: 'id' })
    .select();

  if (error) {
    console.error("Database upsert failed:", error.message);
    process.exit(1);
  }

  console.log(`Successfully seeded ${data ? data.length : 0} products into Supabase!`);
  console.log("Seeded Product Details:", data.map(p => ({ id: p.id, imagesCount: p.images.length })));
}

run();
