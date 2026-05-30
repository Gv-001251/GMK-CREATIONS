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
  console.log("Razorpay SDK keys loaded. Key ID:", env.RAZORPAY_KEY_ID);
  
  // Inspect the razorpay instance methods
  console.log("payments methods:", Object.keys(razorpay.payments || {}));
  console.log("refunds methods:", Object.keys(razorpay.refunds || {}));
  
  // Try calling razorpay.payments.refund
  try {
    console.log("Trying razorpay.payments.refund with dummy id...");
    await razorpay.payments.refund("pay_dummy12345", {
      amount: 100
    });
  } catch (err) {
    console.log("payments.refund error description:", err.description);
    console.log("payments.refund error message:", err.message);
    console.log("payments.refund full error:", err);
  }

  // Try calling razorpay.refunds.create
  try {
    console.log("\nTrying razorpay.refunds.create with dummy id...");
    await razorpay.refunds.create({
      payment_id: "pay_dummy12345",
      amount: 100
    });
  } catch (err) {
    console.log("refunds.create error description:", err.description);
    console.log("refunds.create error message:", err.message);
    console.log("refunds.create full error:", err);
  }
}

run();
