import { z } from "zod";

// ─── Auth Schemas ───
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
});

// ─── Order Schemas ───
export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID required"),
  name: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be positive"),
  material: z.string().optional(),
  finish: z.string().optional(),
  image: z.string().optional(),
  price: z.number().optional(), // client may send this but we ignore it
  storagePath: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Cart cannot be empty"),
  shipping: z.any().optional(),
  shippingInfo: z
    .object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.string().email("Invalid email address"),
      phone: z.string().min(10, "Phone number must be at least 10 digits"),
      address: z.string().min(1, "Address is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      zip: z.string().min(1, "ZIP code is required"),
    })
    .optional(),
  paymentMethod: z.enum(["online", "cod"]).default("online"),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  orderId: z.string().min(1),
});

// ─── Helper ───
export function parseBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map((i) => i.message).join(", "),
    };
  }
  return { success: true, data: result.data };
}

/**
 * Safely parse request JSON, returning a 400 Response on malformed input.
 */
export async function safeParseRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: Response }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: Response.json(
        { error: "Invalid or malformed JSON body" },
        { status: 400 }
      ),
    };
  }
  const result = parseBody(schema, body);
  if (!result.success) {
    return {
      success: false,
      response: Response.json({ error: result.error }, { status: 400 }),
    };
  }
  return { success: true, data: result.data };
}
