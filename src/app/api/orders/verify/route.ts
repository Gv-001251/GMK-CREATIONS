import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = await request.json();

  // Verify Razorpay signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return Response.json(
      { error: "Invalid payment signature" },
      { status: 400 }
    );
  }

  // Update order status in Supabase (use admin client to bypass RLS for update)
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("orders")
    .update({
      status: "confirmed",
      razorpay_payment_id,
      razorpay_signature,
    })
    .eq("id", orderId)
    .eq("razorpay_order_id", razorpay_order_id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, orderId });
}
