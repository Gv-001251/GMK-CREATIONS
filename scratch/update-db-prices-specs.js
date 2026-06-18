const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load env variables from .env.local
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
    console.log("Updating product prices and dimensions in Supabase...");

    const updates = [
      {
        id: "prod-002",
        price: 60.00
      },
      {
        id: "prod-007",
        price: 500.00
      },
      {
        id: "prod-009",
        price: 1250.00,
        dimensions: "170mm x 45mm x 200mm (8 inch height)"
      },
      {
        id: "prod-010",
        price: 2100.00,
        dimensions: "228mm x 228mm x 15mm (9 inch)"
      },
      {
        id: "prod-011",
        price: 1400.00,
        dimensions: "200mm x 45mm x 228mm (9 inch height)"
      }
    ];

    for (const item of updates) {
      const payload = { price: item.price };
      if (item.dimensions) {
        payload.dimensions = item.dimensions;
      }

      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', item.id);

      if (error) throw error;
      console.log(`Updated product ${item.id}: Price -> ₹${item.price}` + (item.dimensions ? `, Dimensions -> ${item.dimensions}` : ''));
    }

    console.log("Database updates completed successfully!");
  } catch (error) {
    console.error("Error updating database products:", error);
    process.exit(1);
  }
}

run();
