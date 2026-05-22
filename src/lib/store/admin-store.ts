import { create } from "zustand";

export interface OrderItem {
  id?: number;
  order_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  material: string;
  finish: string;
  image?: string;
}

export interface Order {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  grand_total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered";
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at: string;
  shipping_first_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
}

interface AdminState {
  orders: Order[];
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<void>;
  getTotalRevenue: () => number;
  getTotalOrders: () => number;
  getAverageOrderValue: () => number;
  getMonthlySales: () => { month: string; revenue: number; orders: number }[];
  getRecentOrders: (limit?: number) => Order[];
}

export const useAdminStore = create<AdminState>()((set, get) => ({
  orders: [],
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/orders/list");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      set({ orders: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    // Optimistic update
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
    }));

    // Persist to server
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {
      // Revert on failure — refetch
      get().fetchOrders();
    }
  },

  getTotalRevenue: () => {
    return get()
      .orders.filter((o) => o.status !== "pending")
      .reduce((sum, o) => sum + o.grand_total, 0);
  },

  getTotalOrders: () => {
    return get().orders.filter((o) => o.status !== "pending").length;
  },

  getAverageOrderValue: () => {
    const confirmed = get().orders.filter((o) => o.status !== "pending");
    if (confirmed.length === 0) return 0;
    return (
      confirmed.reduce((sum, o) => sum + o.grand_total, 0) / confirmed.length
    );
  },

  getMonthlySales: () => {
    const orders = get().orders.filter((o) => o.status !== "pending");
    const monthMap = new Map<string, { revenue: number; orders: number }>();

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthMap.set(key, { revenue: 0, orders: 0 });
    }

    orders.forEach((order) => {
      const d = new Date(order.created_at);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      const current = monthMap.get(key);
      if (current) {
        monthMap.set(key, {
          revenue: current.revenue + order.grand_total,
          orders: current.orders + 1,
        });
      }
    });

    return Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      ...data,
    }));
  },

  getRecentOrders: (limit = 10) => {
    return get().orders.slice(0, limit);
  },
}));
