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
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local.");
  process.exit(1);
}

async function run() {
  const url = `${supabaseUrl}/rest/v1/`;
  console.log("Fetching OpenAPI spec from PostgREST...", url);
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const spec = await res.json();
    
    // Print all paths
    console.log("PostgREST Paths:");
    console.log(Object.keys(spec.paths));
    
    // Look up "orders" schema definition
    const ordersDef = spec.definitions && spec.definitions.orders;
    if (ordersDef) {
      console.log("PostgREST Schema for 'orders':");
      console.log(JSON.stringify(ordersDef.properties, null, 2));
    } else {
      console.log("Could not find 'orders' definition in OpenAPI spec.");
    }

    // Look up "uploads" schema definition
    const uploadsDef = spec.definitions && spec.definitions.uploads;
    if (uploadsDef) {
      console.log("PostgREST Schema for 'uploads':");
      console.log(JSON.stringify(uploadsDef.properties, null, 2));
    } else {
      console.log("Could not find 'uploads' definition in OpenAPI spec.");
    }

    // Look up "order_items" schema definition
    const orderItemsDef = spec.definitions && spec.definitions.order_items;
    if (orderItemsDef) {
      console.log("PostgREST Schema for 'order_items':");
      console.log(JSON.stringify(orderItemsDef.properties, null, 2));
    } else {
      console.log("Could not find 'order_items' definition in OpenAPI spec.");
    }
  } catch (err) {
    console.error("Error fetching spec:", err);
  }
}

run();
