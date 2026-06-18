const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load env variables
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
  try {
    // 1. Fetch current prod-006 images to append the new VR ones
    console.log("Fetching prod-006 details...");
    const { data: prod006, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', 'prod-006')
      .single();

    if (fetchError) throw fetchError;

    const currentImages = prod006.images || [];
    const newVRImages = [
      'https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497347653-vr-developer-double-desk.jpg',
      'https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497349436-vr-developer-figurine-profile.jpg',
      'https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497350056-vr-developer-figurine-threequarter.jpg'
    ];

    // Merge without duplicates
    const updatedImages = [...new Set([...currentImages, ...newVRImages])];

    console.log("Updating VR Developer Desk Set images in DB...");
    const { error: updateError } = await supabase
      .from('products')
      .update({ images: updatedImages })
      .eq('id', 'prod-006');

    if (updateError) throw updateError;
    console.log("Successfully updated VR Developer Desk Set images!");

    // 2. Insert/Upsert new product prod-011
    const productsToUpsert = [
      {
        id: "prod-011",
        name: "Prabhavali Ornate Archway Model",
        slug: "prabhavali-ornate-archway-model",
        description: "Exquisitely detailed 3D printed Prabhavali (divine archway) model finished in premium glossy purple.",
        long_description: "A stunning Prabhavali replica, representing the traditional ornamental arch placed behind deity idols in Hindu temples. Featuring the Kirtimukha (monster-mask protector deity motif) at the crown, flanked by detailed floral scrolls and pillars. 3D printed with extreme detail and finished in a vibrant, glossy purple, it serves as a beautiful backdrop for home shrines or a unique mantle accent.",
        price: 24.99,
        category: "decor",
        image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497350577-prabhavali-archway-main.jpg",
        images: [
          "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497350577-prabhavali-archway-main.jpg",
          "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497348761-prabhavali-archway-held.jpg"
        ],
        badge: "Devotional",
        materials: ["PLA"],
        finishes: ["Gloss", "Matte"],
        dimensions: "160mm x 35mm x 180mm",
        layer_height: "0.12mm (Ultra-Detail)",
        infill_density: "20% Grid",
        recommended_application: "Home Altar / Puja Mandir Backdrop / Spiritual Decor",
        production_days: 2,
        featured: true,
        is_new: true
      }
    ];

    console.log("Upserting new product prod-011 into DB...");
    const { error: upsertError } = await supabase
      .from('products')
      .upsert(productsToUpsert, { onConflict: 'id' });

    if (upsertError) throw upsertError;
    console.log("Successfully upserted prod-011!");

  } catch (error) {
    console.error("Error updating database products:", error);
    process.exit(1);
  }
}

run();
