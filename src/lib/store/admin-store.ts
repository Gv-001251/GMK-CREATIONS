import { create } from "zustand";
import type { Order, OrderItem } from "@/lib/types";
import { toast } from "@/components/toast";

export type { Order, OrderItem };

interface AdminState {
  orders: Order[];
  isLoading: boolean;
  fetchOrders: (limit?: number, offset?: number) => Promise<void>;
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

  fetchOrders: async (limit = 100, offset = 0) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/orders/list?limit=${limit}&offset=${offset}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const responseData = await res.json();
      const items = Array.isArray(responseData) ? responseData : (responseData.data || []);
      set((state) => ({
        orders: offset === 0 ? items : [...state.orders, ...items],
        isLoading: false
      }));
    } catch {
      if (offset === 0) set({ orders: [], isLoading: false });
      else set({ isLoading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    // Snapshot for rollback if the request fails
    const previousOrders = get().orders;

    // Optimistic update
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
    }));

    // Persist to server
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update order status");
      }
    } catch (err) {
      // Revert optimistic update on failure and surface the error
      set({ orders: previousOrders });
      toast.error(
        err instanceof Error ? err.message : "Failed to update order status"
      );
    }
  },

  getTotalRevenue: () => {
    return get()
      .orders.filter((o) => o.status !== "pending" && o.status !== "cancelled")
      .reduce((sum, o) => sum + o.grand_total, 0);
  },

  getTotalOrders: () => {
    return get().orders.filter((o) => o.status !== "pending" && o.status !== "cancelled").length;
  },

  getAverageOrderValue: () => {
    const confirmed = get().orders.filter((o) => o.status !== "pending" && o.status !== "cancelled");
    if (confirmed.length === 0) return 0;
    return (
      confirmed.reduce((sum, o) => sum + o.grand_total, 0) / confirmed.length
    );
  },

  getMonthlySales: () => {
    const orders = get().orders.filter((o) => o.status !== "pending" && o.status !== "cancelled");
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
