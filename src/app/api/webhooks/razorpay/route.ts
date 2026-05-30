import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not defined");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Invalid webhook signature received");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Parse verified payload
    const body = JSON.parse(rawBody);

    console.log(`Webhook received: ${body.event}`);

    const supabase = createAdminClient();

    // Handle 'order.paid' event
    if (body.event === "order.paid") {
      const razorpayOrderId = body.payload.order.entity.id;
      const paymentId = body.payload.payment.entity.id;

      // Update the order in the database
      const { error } = await supabase
        .from("orders")
        .update({
          status: "confirmed",
          razorpay_payment_id: paymentId,
        })
        .eq("razorpay_order_id", razorpayOrderId);

      if (error) {
        console.error("Error updating order from webhook:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      console.log(`Order ${razorpayOrderId} marked as confirmed via webhook.`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
