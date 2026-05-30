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

const mockProductIds = [
  "cyber-panda",
  "industrial-gears",
  "vortex-vase",
  "draco-keycaps",
  "apex-stand",
  "rogue-minis",
  "titan-x-drone",
  "fractal-lamp",
  "organic-sculptures",
  "architectural-models",
  "precision-tools",
  "bio-chess"
];

async function run() {
  console.log("Deleting mock products from Supabase database...");
  const { data, error } = await supabase
    .from('products')
    .delete()
    .in('id', mockProductIds)
    .select();

  if (error) {
    console.error("Error deleting products:", error);
    process.exit(1);
  }
  console.log(`Successfully deleted ${data ? data.length : 0} mock products from DB:`, data ? data.map(p => p.id) : []);
}

run();
