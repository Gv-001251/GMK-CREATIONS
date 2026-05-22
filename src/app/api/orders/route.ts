import { createClient } from "@/lib/supabase/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  const supabase = await createClient();

  // Require authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { items, shipping, shippingInfo } = await request.json();

  if (!items || items.length === 0) {
    return Response.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Calculate totals
  const subtotal = items.reduce(
    (sum: number, item: { price: number; quantity: number }) =>
      sum + item.price * item.quantity,
    0
  );
  const shippingCost = subtotal > 100 ? 0 : 12.99;
  const grandTotal = subtotal + shippingCost;

  // Generate order ID
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

  // Create Razorpay order (amount in paise — INR smallest unit)
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(grandTotal * 100),
    currency: "INR",
    receipt: orderId,
    notes: {
      user_id: user.id,
      user_email: user.email || "",
    },
  });

  // Store pending order in Supabase
  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    user_id: user.id,
    user_name: shippingInfo?.firstName
      ? `${shippingInfo.firstName} ${shippingInfo.lastName}`
      : user.user_metadata?.name || "Customer",
    user_email: shippingInfo?.email || user.email,
    status: "pending",
    subtotal,
    shipping_cost: shippingCost,
    grand_total: grandTotal,
    shipping_first_name: shippingInfo?.firstName,
    shipping_last_name: shippingInfo?.lastName,
    shipping_email: shippingInfo?.email,
    shipping_address: shippingInfo?.address,
    shipping_city: shippingInfo?.city,
    shipping_state: shippingInfo?.state,
    shipping_zip: shippingInfo?.zip,
    razorpay_order_id: razorpayOrder.id,
  });

  if (orderError) {
    return Response.json({ error: orderError.message }, { status: 500 });
  }

  // Store order items
  const orderItems = items.map(
    (item: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      material: string;
      finish: string;
      image: string;
    }) => ({
      order_id: orderId,
      product_id: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      material: item.material,
      finish: item.finish,
      image: item.image,
    })
  );

  await supabase.from("order_items").insert(orderItems);

  return Response.json({
    orderId,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    shipping,
  });
}
