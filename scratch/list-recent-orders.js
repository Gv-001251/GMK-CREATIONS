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
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("Fetching recent orders...");
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching orders:", error);
    return;
  }

  orders.forEach(o => {
    console.log(`Order ID: ${o.id}`);
    console.log(`  User: ${o.user_name} (${o.user_email})`);
    console.log(`  Status: ${o.status}`);
    console.log(`  Grand Total: ₹${o.grand_total}`);
    console.log(`  Razorpay Order ID: ${o.razorpay_order_id}`);
    console.log(`  Razorpay Payment ID: ${o.razorpay_payment_id}`);
    console.log(`  Razorpay Signature: ${o.razorpay_signature}`);
    console.log(`  Created At: ${o.created_at}`);
    console.log('----------------------------');
  });
}

run();
