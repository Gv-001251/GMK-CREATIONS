const Razorpay = require('razorpay');
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

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID || '',
  key_secret: env.RAZORPAY_KEY_SECRET || '',
});

async function run() {
  const paymentId = 'pay_StSKMa0AiAMbBI';
  console.log(`Fetching details for payment ${paymentId}...`);
  
  try {
    const res = await razorpay.payments.fetch(paymentId);
    console.log("Payment details:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Fetch failed!", err);
  }
}

run();
