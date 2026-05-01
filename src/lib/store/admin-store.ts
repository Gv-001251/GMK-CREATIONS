import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    material: string;
    finish: string;
  }[];
  total: number;
  shipping: number;
  grandTotal: number;
  status: "confirmed" | "processing" | "shipped" | "delivered";
  createdAt: string;
}

interface AdminState {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "status" | "createdAt">) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  getTotalRevenue: () => number;
  getTotalOrders: () => number;
  getAverageOrderValue: () => number;
  getMonthlySales: () => { month: string; revenue: number; orders: number }[];
  getRecentOrders: (limit?: number) => Order[];
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: `ORD-${Date.now().toString(36).toUpperCase()}`,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ orders: [newOrder, ...state.orders] }));
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
        }));
      },

      getTotalRevenue: () => {
        return get().orders.reduce((sum, o) => sum + o.grandTotal, 0);
      },

      getTotalOrders: () => {
        return get().orders.length;
      },

      getAverageOrderValue: () => {
        const orders = get().orders;
        if (orders.length === 0) return 0;
        return orders.reduce((sum, o) => sum + o.grandTotal, 0) / orders.length;
      },

      getMonthlySales: () => {
        const orders = get().orders;
        const monthMap = new Map<string, { revenue: number; orders: number }>();

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Initialize last 6 months
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
          monthMap.set(key, { revenue: 0, orders: 0 });
        }

        orders.forEach((order) => {
          const d = new Date(order.createdAt);
          const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
          const current = monthMap.get(key);
          if (current) {
            monthMap.set(key, {
              revenue: current.revenue + order.grandTotal,
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
    }),
    {
      name: "gmk-admin",
    }
  )
);
