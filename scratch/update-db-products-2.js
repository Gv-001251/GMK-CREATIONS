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
    const productsToUpsert = [
      {
        id: "prod-008",
        name: "Elephant Desk Organizer & Pen Holder",
        slug: "elephant-desk-organizer-pen-holder",
        description: "Charming elephant desk organizer and pen holder printed in premium bronze-gold PLA.",
        long_description: "Keep your workspace tidy and delightful with this 3D printed Elephant Pen Holder and Desk Organizer. Featuring a cute baby elephant sitting on a wooden barrel connected to a hollow log/cup for holding pens, pencils, rulers, or brushes. Printed in a rich, shiny bronze-gold finish, this desk buddy is both highly functional and decorative.",
        price: 18.99,
        category: "decor",
        image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497198776-elephant-organizer-front-1.jpg",
        images: [
          "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497198776-elephant-organizer-front-1.jpg",
          "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497199305-elephant-organizer-front-2.jpg",
          "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497197371-elephant-organizer-back.jpg"
        ],
        badge: "Desk Organizer",
        materials: ["PLA"],
        finishes: ["Metallic", "Matte"],
        dimensions: "120mm x 85mm x 150mm",
        layer_height: "0.16mm (Detail)",
        infill_density: "20% Gyroid",
        recommended_application: "Office desks / Kids rooms / Art studio organizer",
        production_days: 3,
        featured: true,
        is_new: true
      },
      {
        id: "prod-009",
        name: "Sudarshana Chakra Devotional Replica",
        slug: "sudarshana-chakra-devotional-replica",
        description: "Ornate 3D printed replica of the Sudarshana Chakra on a display stand, finished in a serene light blue.",
        long_description: "A beautifully detailed, symmetrical 3D printed replica of the Sudarshana Chakra, the divine disc weapon of Lord Vishnu. Featuring intricate star patterns and decorative leaf structures on the outer rim, complete with an elegant circular pedestal stand. Finished in a calm pastel blue, it makes for a wonderful devotional accent piece in home altars, offices, or living rooms.",
        price: 22.99,
        category: "decor",
        image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497199773-sudarshana-chakra-display.jpg",
        images: [
          "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497199773-sudarshana-chakra-display.jpg"
        ],
        badge: "Devotional",
        materials: ["PLA"],
        finishes: ["Matte"],
        dimensions: "150mm x 40mm x 180mm",
        layer_height: "0.16mm (Detail)",
        infill_density: "15% Grid",
        recommended_application: "Puja Room / Spiritual Home Decor / Sacred Gift",
        production_days: 2,
        featured: true,
        is_new: true
      },
      {
        id: "prod-010",
        name: "Mandala Flower Decorative Tile",
        slug: "mandala-flower-decorative-tile",
        description: "3D printed geometric mandala flower wall plaque/tile in vibrant blue.",
        long_description: "Add a touch of geometric elegance to your walls or shelves with this 3D printed Mandala Flower Tile. Inspired by classical architectural stone carvings, this decorative tile features layered petals radiating from a central grid pattern, creating a beautiful depth effect. Printed in a vibrant solid blue, it can be mounted on walls, displayed on stands, or used in creative layouts.",
        price: 15.99,
        category: "decor",
        image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497200571-mandala-flower-tile.jpg",
        images: [
          "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497200571-mandala-flower-tile.jpg"
        ],
        badge: "Wall Decor",
        materials: ["PLA"],
        finishes: ["Matte"],
        dimensions: "150mm x 150mm x 15mm",
        layer_height: "0.2mm (Standard)",
        infill_density: "15% Grid",
        recommended_application: "Wall Art / Display Stand Decor / Shelf Accent",
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
    console.log("Successfully upserted prod-008, prod-009, and prod-010!");

  } catch (error) {
    console.error("Error updating database products:", error);
    process.exit(1);
  }
}

run();
