import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeParseRequest, createOrderSchema } from "@/lib/validations";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function GET(request: Request) {
  const supabase = await createClient();

  // Require authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch user's orders (exclude pending orders as they are abandoned carts)
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "pending")
    .order("created_at", { ascending: false });

  if (ordersError) {
    return Response.json({ error: ordersError.message }, { status: 500 });
  }

  const orderIds = (orders || []).map((o: { id: string }) => o.id);
  if (orderIds.length === 0) {
    return Response.json([]);
  }

  // Fetch items for all these orders
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);

  if (itemsError) {
    return Response.json({ error: itemsError.message }, { status: 500 });
  }

  // Attach items to orders
  const ordersWithItems = (orders || []).map(
    (order: { id: string; [key: string]: unknown }) => ({
      ...order,
      items: (items || []).filter(
        (item: { order_id: string }) => item.order_id === order.id
      ),
    })
  );

  return Response.json(ordersWithItems);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  // Require authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Validate request body with zod
  const parsed = await safeParseRequest(request, createOrderSchema);
  if (!parsed.success) return parsed.response;
  const { items, shipping, shippingInfo, paymentMethod } = parsed.data;

  // --- Server-side price lookup (prevent price tampering) ---
  const adminDb = createAdminClient();
  const productIds = items.map((item) => item.productId);
  const { data: dbProducts, error: productLookupError } = await adminDb
    .from("products")
    .select("id, price")
    .in("id", productIds);

  if (productLookupError || !dbProducts) {
    console.error("Product lookup error:", productLookupError);
    return Response.json({ error: "Failed to look up product prices" }, { status: 500 });
  }

  const priceMap = new Map(dbProducts.map((p: { id: string; price: number }) => [p.id, p.price]));

  // Verify all products exist
  for (const item of items) {
    if (!priceMap.has(item.productId)) {
      return Response.json(
        { error: `Product not found: ${item.productId}` },
        { status: 400 }
      );
    }
  }

  // Calculate totals using DB prices, NOT client prices
  const subtotal = items.reduce(
    (sum, item) => sum + (priceMap.get(item.productId) || 0) * item.quantity,
    0
  );
  const shippingCost = subtotal > 100 ? 0 : 12.99;
  const grandTotal = subtotal + shippingCost;

  // Generate order ID
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

  let razorpayOrderId = null;
  let razorpayAmount = 0;
  let razorpayCurrency = "INR";
  let orderStatus = "pending";

  if (paymentMethod === "online") {
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
    razorpayOrderId = razorpayOrder.id;
    razorpayAmount = Number(razorpayOrder.amount);
    razorpayCurrency = razorpayOrder.currency;
  } else {
    // For COD, the order status starts directly as "confirmed"
    orderStatus = "confirmed";
  }

  // Store order in Supabase
  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    user_id: user.id,
    user_name: shippingInfo?.firstName
      ? `${shippingInfo.firstName} ${shippingInfo.lastName}`
      : user.user_metadata?.name || "Customer",
    user_email: shippingInfo?.email || user.email,
    status: orderStatus,
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
    razorpay_order_id: razorpayOrderId,
  });

  if (orderError) {
    console.error("Order creation failed:", orderError.message);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }

  // Store order items using DB-verified prices
  const orderItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    name: item.name || "",
    price: priceMap.get(item.productId) || 0, // DB price, not client price
    quantity: item.quantity,
    material: item.material || null,
    finish: item.finish || null,
    image: item.image || null,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) {
    console.error("Failed to insert order items:", itemsError.message);
    // Order was created but items failed — log for manual fix
  }

  return Response.json({
    orderId,
    razorpayOrderId,
    amount: razorpayAmount || Math.round(grandTotal * 100),
    currency: razorpayCurrency,
    shipping,
  });
}
