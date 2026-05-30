// ─── Shared Type Definitions ───
// Single source of truth for all types used across the application.

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id?: number;
  order_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  material?: string;
  finish?: string;
  image?: string;
}

export interface Order {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  grand_total: number;
  status: OrderStatus;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  created_at: string;
  updated_at?: string;
  shipping_first_name?: string;
  shipping_last_name?: string;
  shipping_email?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}
