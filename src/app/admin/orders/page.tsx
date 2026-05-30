"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/lib/store/admin-store";
import { ClipboardList } from "lucide-react";

export default function AdminOrdersPage() {
  const { fetchOrders, getRecentOrders, updateOrderStatus, isLoading } = useAdminStore();
  
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const orders = getRecentOrders(50);

  const statusColors: Record<string, string> = {
    pending: "bg-surface-container text-on-surface-variant border-outline-variant",
    confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    processing: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    shipped: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    cancelled: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };

  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-on-surface tracking-tight">Orders</h1>
        <p className="text-on-surface-variant mt-2">Manage customer orders and update shipping statuses.</p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-on-surface">
          Recent Orders ({orders.length})
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-surface-container-lowest border border-outline-variant">
          <ClipboardList className="w-12 h-12 text-on-surface-variant/30 mb-4" />
          <p className="text-on-surface-variant text-sm">
            No orders yet. Orders will appear here after customers purchase.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="py-4 px-6 font-semibold text-on-surface-variant">Order ID</th>
                  <th className="py-4 px-6 font-semibold text-on-surface-variant">Customer</th>
                  <th className="py-4 px-6 font-semibold text-on-surface-variant">Items</th>
                  <th className="py-4 px-6 font-semibold text-right text-on-surface-variant">Total</th>
                  <th className="py-4 px-6 font-semibold text-center text-on-surface-variant">Status</th>
                  <th className="py-4 px-6 font-semibold text-right text-on-surface-variant">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-outline-variant last:border-0 hover:bg-surface-container-low/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-on-surface font-mono text-xs">
                      {order.id}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-on-surface">{order.user_name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{order.user_email}</p>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="py-4 px-6 text-right font-heading font-bold text-on-surface">
                      ₹{order.grand_total.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as typeof statuses[number])}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize outline-none cursor-pointer transition-colors border ${
                          statusColors[order.status] || "bg-surface-container-lowest text-on-surface border-outline-variant"
                        }`}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s} className="bg-surface-container-lowest text-on-surface">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right text-xs font-medium text-on-surface-variant">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
