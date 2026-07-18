import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeParseRequest, createOrderSchema } from "@/lib/validations";
import { getRazorpay } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { calculateOrderTotals, CUSTOM_PRINT_MIN_PRICE } from "@/lib/pricing";
import { ONLINE_PAYMENT_ENABLED } from "@/lib/payment-config";

export async function GET(_request: Request) {
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

  // Online payment (Razorpay) is disabled until the account is validated.
  // Reject any online-payment order server-side as a safety net.
  if (paymentMethod === "online" && !ONLINE_PAYMENT_ENABLED) {
    return Response.json(
      { error: "Online payment is currently unavailable. Please use Cash on Delivery." },
      { status: 400 }
    );
  }

  // A "custom print" is a user-uploaded model (has a storagePath, or an
  // "upload-" / legacy "custom-<ts>" id WITH an attached file). These are
  // priced from the client value with a server-enforced floor. Everything
  // else — including admin-created catalog products — must be price-verified
  // against the database to prevent tampering.
  const isCustomPrint = (item: (typeof items)[number]) =>
    !!item.storagePath || item.productId.startsWith("upload-");

  // --- Server-side price lookup (prevent price tampering) ---
  const adminDb = createAdminClient();
  const catalogItems = items.filter((item) => !isCustomPrint(item));
  const catalogProductIds = catalogItems.map((item) => item.productId);
  let priceMap = new Map<string, number>();

  if (catalogProductIds.length > 0) {
    const { data: dbProducts, error: productLookupError } = await adminDb
      .from("products")
      .select("id, price")
      .in("id", catalogProductIds);

    if (productLookupError || !dbProducts) {
      console.error("Product lookup error:", productLookupError);
      return Response.json({ error: "Failed to look up product prices" }, { status: 500 });
    }

    priceMap = new Map(dbProducts.map((p: { id: string; price: number }) => [p.id, p.price]));

    // Verify catalog products exist
    for (const item of catalogItems) {
      if (!priceMap.has(item.productId)) {
        return Response.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
    }
  }

  // SECURITY: enforce a minimum price floor on custom prints to prevent price tampering
  const subtotal = items.reduce((sum, item) => {
    const isCustom = isCustomPrint(item);
    let unitPrice: number;
    if (isCustom) {
      const clientPrice = item.price || 0;
      unitPrice = Math.max(clientPrice, CUSTOM_PRINT_MIN_PRICE);
    } else {
      unitPrice = priceMap.get(item.productId) || 0;
    }
    return sum + unitPrice * item.quantity;
  }, 0);

  const { shippingCost, grandTotal } = calculateOrderTotals(subtotal);

  // Generate order ID
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

  let razorpayOrderId = null;
  let razorpayAmount = 0;
  let razorpayCurrency = "INR";
  let orderStatus = "pending";

  if (paymentMethod === "online") {
    const amountInPaise = Math.round(grandTotal * 100);
    if (amountInPaise < 100) {
      return Response.json(
        { error: "Amount must be at least 100 paise" },
        { status: 400 }
      );
    }

    try {
      const razorpay = getRazorpay();
      // Create Razorpay order (amount in paise — INR smallest unit)
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
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
    } catch (err: unknown) {
      const error = err as { statusCode?: number; status?: number; message?: string };
      console.error("Razorpay order creation error:", error);
      // Handle auth failures (return 401)
      if (
        error.statusCode === 401 ||
        error.status === 401 ||
        (error.message && error.message.toLowerCase().includes("auth")) ||
        (error.message && error.message.toLowerCase().includes("key"))
      ) {
        return Response.json(
          { error: "Razorpay authentication failed" },
          { status: 401 }
        );
      }
      return Response.json(
        { error: error.message || "Failed to create Razorpay order" },
        { status: 500 }
      );
    }
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
    shipping_phone: shippingInfo?.phone,
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

  // Store order items using DB-verified prices for catalog and client-passed prices for custom items
  const orderItems = items.map((item) => {
    const isCustom = isCustomPrint(item);
    const rawPrice = isCustom ? (item.price || 0) : (priceMap.get(item.productId) || 0);
    const verifiedPrice = isCustom ? Math.max(rawPrice, CUSTOM_PRINT_MIN_PRICE) : rawPrice;

    // Carry custom upload path through to finish field using bracket format [File: path]
    const finishText = item.storagePath
      ? `${item.finish || ""} [File: ${item.storagePath}]`
      : item.finish || null;

    let materialText = item.material || "";
    if (item.primaryColor) {
      if (item.secondaryColor) {
        materialText += ` (Base: ${item.primaryColor}, Accent: ${item.secondaryColor})`;
      } else {
        materialText += ` (Color: ${item.primaryColor})`;
      }
    }

    return {
      order_id: orderId,
      product_id: item.productId,
      name: item.name || "",
      price: verifiedPrice,
      quantity: item.quantity,
      material: materialText || null,
      finish: finishText,
      image: item.image || null,
    };
  });

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) {
    console.error("Failed to insert order items:", itemsError.message);
    // Roll back the order so we never leave an orphan order with no line items.
    // Use the admin client (bypasses RLS) to guarantee the cleanup succeeds.
    await adminDb.from("order_items").delete().eq("order_id", orderId);
    await adminDb.from("orders").delete().eq("id", orderId);
    return Response.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }

  // For COD orders, send confirmation email immediately (online orders are emailed after payment verify)
  if (paymentMethod === "cod") {
    try {
      await sendOrderConfirmationEmail({
        orderId,
        customerName: shippingInfo?.firstName
          ? `${shippingInfo.firstName} ${shippingInfo.lastName}`
          : user.user_metadata?.name || "Customer",
        customerEmail: shippingInfo?.email || user.email || "",
        grandTotal,
        items: orderItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          material: i.material || undefined,
        })),
      });
    } catch (emailErr) {
      console.error("COD confirmation email failed (non-fatal):", emailErr);
    }
  }

  return Response.json({
    orderId,
    razorpayOrderId,
    amount: razorpayAmount || Math.round(grandTotal * 100),
    currency: razorpayCurrency,
    shipping,
  });
}


