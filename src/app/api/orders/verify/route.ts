import crypto from "crypto";
import Razorpay from "razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeParseRequest, verifyPaymentSchema } from "@/lib/validations";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  // Validate request body
  const parsed = await safeParseRequest(request, verifyPaymentSchema);
  if (!parsed.success) return parsed.response;

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } =
    parsed.data;

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

  const supabase = createAdminClient();

  // --- Amount verification: cross-check paid amount against order total ---
  const { data: order, error: orderFetchError } = await supabase
    .from("orders")
    .select("grand_total")
    .eq("id", orderId)
    .eq("razorpay_order_id", razorpay_order_id)
    .single();

  if (orderFetchError || !order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    const expectedAmount = Math.round(order.grand_total * 100);
    if (Number(razorpayOrder.amount) !== expectedAmount) {
      console.error(
        `Amount mismatch for order ${orderId}: expected ${expectedAmount}, got ${razorpayOrder.amount}`
      );
      return Response.json(
        { error: "Payment amount mismatch" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Failed to verify payment amount with Razorpay:", err);
    // Allow through if Razorpay API is unreachable — signature was already verified
  }

  // Update order status
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
    console.error("Failed to update order status:", error.message);
    return Response.json({ error: "Failed to confirm order" }, { status: 500 });
  }

  return Response.json({ success: true, orderId });
}
