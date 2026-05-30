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
  console.log("Checking orders table columns...");
  
  // Attempt to select columns
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error checking orders table:", error);
  } else {
    console.log("Query succeeded!");
    if (data && data.length > 0) {
      console.log("Available columns in first row:", Object.keys(data[0]));
    } else {
      console.log("Orders table is empty, trying to inspect table structure via a dummy insert or another query...");
      
      // Let's try to query public.orders via a system RPC or a test insert
      const dummyId = `test-${Date.now()}`;
      const { data: insertData, error: insertError } = await supabase
        .from('orders')
        .insert({
          id: dummyId,
          grand_total: 0,
          razorpay_order_id: 'test'
        })
        .select();

      if (insertError) {
        console.error("Dummy insert failed. Error details:", insertError);
      } else {
        console.log("Dummy insert succeeded! Columns returned:", Object.keys(insertData[0]));
        // Clean up
        await supabase.from('orders').delete().eq('id', dummyId);
      }
    }
  }
}

run();
