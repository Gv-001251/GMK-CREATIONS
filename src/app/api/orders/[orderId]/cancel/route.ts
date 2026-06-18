import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpay } from "@/lib/razorpay";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  // 1. Authenticate user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Fetch the target order using user's supabase client
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  // 3. Double-check ownership
  if (order.user_id !== user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 4. Verify the order is in a cancellable status ("pending" or "confirmed")
  const cancellableStatuses = ["pending", "confirmed"];
  if (!cancellableStatuses.includes(order.status?.toLowerCase())) {
    return Response.json(
      { error: `Orders in '${order.status}' status cannot be cancelled` },
      { status: 400 }
    );
  }

  let refundStatus = "none";
  let refundErrorMsg = null;

  // 5. If the order has been paid online, initiate automated Razorpay refund
  if (order.razorpay_payment_id) {
    try {
      const razorpay = getRazorpay();
      await razorpay.payments.refund(order.razorpay_payment_id, {
        amount: Math.round(order.grand_total * 100), // in paise (INR smallest unit)
        notes: {
          order_id: orderId,
          reason: "Customer requested cancellation from 'My Orders' portal",
        },
      });
      refundStatus = "processed";
    } catch (refundError: unknown) {
      console.error("Razorpay refund error:", refundError);
      refundStatus = "failed";
      refundErrorMsg = "Refund could not be processed automatically. Our team will process it manually within 2-3 business days.";
    }
  }

  // 6. Transition status of the order to 'cancelled'
  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId);

  if (updateError) {
    console.error("Failed to cancel order:", updateError.message);
    return Response.json({ error: "Failed to cancel order" }, { status: 500 });
  }

  return Response.json({ 
    success: true,
    refundStatus,
    refundError: refundErrorMsg
  });
}
