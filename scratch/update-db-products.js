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
    // 1. Fetch current prod-001 images to append the green UFO ones
    console.log("Fetching prod-001 details...");
    const { data: prod001, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', 'prod-001')
      .single();

    if (fetchError) throw fetchError;

    const currentImages = prod001.images || [];
    const newGreenImages = [
      'https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496974899-ufo-lamp-green-1.jpg',
      'https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496976559-ufo-lamp-green-2.jpg'
    ];

    // Merge without duplicates
    const updatedImages = [...new Set([...currentImages, ...newGreenImages])];

    console.log("Updating Alien UFO Lamp images in DB...");
    const { error: updateError } = await supabase
      .from('products')
      .update({ images: updatedImages })
      .eq('id', 'prod-001');

    if (updateError) throw updateError;
    console.log("Successfully updated Alien UFO Lamp images!");

    // 2. Insert/Upsert new products prod-006 and prod-007
    const productsToUpsert = [
      {
        id: "prod-006",
        name: "Miniature VR Developer Desk Set",
        slug: "miniature-vr-developer-desk-set",
        description: "Highly detailed 3D printed miniature desk set featuring a developer wearing a VR headset.",
        long_description: "A perfect desk companion for programmers, tech enthusiasts, and VR lovers. This miniature set features a detailed figure wearing a virtual reality headset sitting behind a desk, along with a separate detailed miniature office table. 3D printed with high precision to capture micro-details.",
        price: 12.99,
        category: "miniatures",
        image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496978571-vr-developer-desk-set.jpg",
        images: [
          "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496978571-vr-developer-desk-set.jpg",
          "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496980110-vr-developer-desk-angle.jpg"
        ],
        badge: "New",
        materials: ["PLA"],
        finishes: ["Matte"],
        dimensions: "60mm x 60mm x 75mm",
        layer_height: "0.12mm (Ultra-Detail)",
        infill_density: "20% Gyroid",
        recommended_application: "Desk accessory / Geeky collectible / Miniature diorama",
        production_days: 2,
        featured: true,
        is_new: true
      },
      {
        id: "prod-007",
        name: "Articulated Robot Figure",
        slug: "articulated-robot-figure",
        description: "Poseable articulated miniature robot model with moveable joints.",
        long_description: "An adorable 3D printed articulated robot figure. Featuring moveable limbs and a retro design with a small antenna on its head. Printed as a single piece with integrated joints (print-in-place), this robot is fully poseable and fun to play with. Great as a fidget toy, desk buddy, or decorative miniature.",
        price: 9.99,
        category: "miniatures",
        image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496984839-miniature-robot-grey.jpg",
        images: [
          "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496984839-miniature-robot-grey.jpg"
        ],
        badge: "Fidget Toy",
        materials: ["PLA"],
        finishes: ["Matte"],
        dimensions: "45mm x 20mm x 80mm",
        layer_height: "0.16mm (Detail)",
        infill_density: "15% Grid",
        recommended_application: "Fidget toy / Desk decoration / Gift",
        production_days: 2,
        featured: true,
        is_new: true
      }
    ];

    console.log("Upserting new products into DB...");
    const { error: upsertError } = await supabase
      .from('products')
      .upsert(productsToUpsert, { onConflict: 'id' });

    if (upsertError) throw upsertError;
    console.log("Successfully upserted prod-006 and prod-007!");

  } catch (error) {
    console.error("Error updating database products:", error);
    process.exit(1);
  }
}

run();
