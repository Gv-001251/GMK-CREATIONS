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
    console.log("Updating database prices...");

    // 1. Update existing products' prices
    const updates = [
      { id: "prod-001", price: 1600.00 },
      { id: "prod-002", price: 150.00 },
      { id: "prod-003", price: 600.00 },
      { id: "prod-004", price: 1300.00 },
      { id: "prod-005", price: 100.00 },
      { id: "prod-006", price: 1000.00 },
      { id: "prod-007", price: 250.00 },
      { id: "prod-008", price: 3200.00 },
      { id: "prod-009", price: 1200.00 },
      { id: "prod-010", price: 800.00 },
      { id: "prod-011", price: 1800.00 }
    ];

    for (const item of updates) {
      const { error } = await supabase
        .from('products')
        .update({ price: item.price })
        .eq('id', item.id);
      if (error) throw error;
      console.log(`Updated price for ${item.id} to ₹${item.price}`);
    }

    // 2. Insert prod-012 (Miniature Office Desk)
    const prod012 = {
      id: "prod-012",
      name: "Miniature Office Desk",
      slug: "miniature-office-desk",
      description: "Sleek 3D printed miniature blue office desk/table model.",
      long_description: "A clean and minimalist 3D printed miniature office desk. Perfect as a standalone desk model for dioramas, miniature scenes, or as a cute decoration. Featuring a light-blue textured top surface and grey legs.",
      price: 100.00,
      category: "miniatures",
      image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496980110-vr-developer-desk-angle.jpg",
      images: [
        "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496980110-vr-developer-desk-angle.jpg"
      ],
      badge: "Miniature",
      materials: ["PLA"],
      finishes: ["Matte"],
      dimensions: "60mm x 60mm x 45mm",
      layer_height: "0.16mm (Detail)",
      infill_density: "15% Grid",
      recommended_application: "Miniature scenes / Diorama accessories",
      production_days: 1,
      featured: true,
      is_new: true
    };

    console.log("Upserting prod-012 into DB...");
    const { error: upsertError } = await supabase
      .from('products')
      .upsert(prod012, { onConflict: 'id' });

    if (upsertError) throw upsertError;
    console.log("Successfully seeded prod-012 in database!");

  } catch (error) {
    console.error("Error updating prices:", error);
    process.exit(1);
  }
}

run();
