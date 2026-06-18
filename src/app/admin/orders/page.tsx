"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/lib/store/admin-store";
import { ClipboardList, ChevronDown, ChevronUp, Download, Eye, FileSpreadsheet, Loader2 } from "lucide-react";
import Image from "next/image";

// Helper to extract custom file path from the finish column string
function extractStoragePath(finishText: string | null | undefined): { cleanFinish: string; storagePath: string | null } {
  if (!finishText) return { cleanFinish: "", storagePath: null };
  const match = finishText.match(/(.*)\s*\[File:\s*(.*?)\]/);
  if (match) {
    return {
      cleanFinish: match[1].trim(),
      storagePath: match[2].trim(),
    };
  }
  return { cleanFinish: finishText, storagePath: null };
}

export default function AdminOrdersPage() {
  const { fetchOrders, getRecentOrders, updateOrderStatus, isLoading } = useAdminStore();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [downloadingPath, setDownloadingPath] = useState<string | null>(null);
  
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

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleDownloadModel = async (path: string, fileName: string) => {
    setDownloadingPath(path);
    try {
      const res = await fetch("/api/admin/models/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });

      if (!res.ok) {
        throw new Error("Failed to sign URL");
      }

      const { signedUrl } = await res.json();
      
      // Trigger file download in browser
      const a = document.createElement("a");
      a.href = signedUrl;
      // Extract original filename from path (the part after timestamp)
      const parts = path.split("-");
      const cleanName = parts.slice(1).join("-") || fileName || "model.stl";
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download model file. Please verify network connection.");
    } finally {
      setDownloadingPath(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-on-surface tracking-tight">Orders</h1>
        <p className="text-on-surface-variant mt-2">Manage customer orders, view custom 3D models, and update shipping statuses.</p>
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
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="py-4 px-6 font-semibold text-on-surface-variant w-10"></th>
                  <th className="py-4 px-6 font-semibold text-on-surface-variant">Order ID</th>
                  <th className="py-4 px-6 font-semibold text-on-surface-variant">Customer</th>
                  <th className="py-4 px-6 font-semibold text-on-surface-variant">Items</th>
                  <th className="py-4 px-6 font-semibold text-right text-on-surface-variant">Total</th>
                  <th className="py-4 px-6 font-semibold text-center text-on-surface-variant">Status</th>
                  <th className="py-4 px-6 font-semibold text-right text-on-surface-variant">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <>
                      <tr
                        key={order.id}
                        className={`border-b border-outline-variant last:border-0 hover:bg-surface-container-low/30 transition-colors cursor-pointer ${isExpanded ? 'bg-surface-container-low/20' : ''}`}
                        onClick={() => toggleExpand(order.id)}
                      >
                        <td className="py-4 px-6">
                          <button type="button" className="text-on-surface-variant hover:text-on-surface">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
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
                        <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
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

                      {/* Expandable Order Detail View */}
                      {isExpanded && (
                        <tr className="bg-surface-container-lowest border-b border-outline-variant">
                          <td colSpan={7} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-on-surface">
                              {/* Shipping Information column */}
                              <div className="space-y-3 p-5 rounded-2xl bg-surface-container-low border border-outline-variant">
                                <h4 className="font-heading text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                                  Shipping Address
                                </h4>
                                <div className="text-sm space-y-1">
                                  <p className="font-semibold">{order.shipping_first_name} {order.shipping_last_name}</p>
                                  <p className="text-on-surface-variant">{order.shipping_address}</p>
                                  <p className="text-on-surface-variant">
                                    {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                                  </p>
                                  <p className="text-xs text-primary font-medium pt-2">{order.shipping_email}</p>
                                </div>
                              </div>

                              {/* Order items listing column */}
                              <div className="md:col-span-2 space-y-4">
                                <h4 className="font-heading text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                                  Items Breakdown
                                </h4>
                                <div className="space-y-3">
                                  {order.items.map((item, idx) => {
                                    const { cleanFinish, storagePath } = extractStoragePath(item.finish);
                                    return (
                                      <div
                                        key={item.id || idx}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant gap-4"
                                      >
                                        <div className="flex items-center gap-4">
                                          {item.image && (
                                            <div className="relative w-12 h-12 rounded-lg bg-surface-container-highest border border-outline-variant overflow-hidden shrink-0">
                                              <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                unoptimized={item.image.startsWith("data:")}
                                              />
                                            </div>
                                          )}
                                          <div>
                                            <h5 className="text-sm font-bold text-on-surface leading-tight">
                                              {item.name}
                                            </h5>
                                            <p className="text-xs text-on-surface-variant mt-1">
                                              Material: <span className="font-medium text-on-surface">{item.material}</span>
                                            </p>
                                            <p className="text-xs text-on-surface-variant mt-0.5">
                                              Finish: <span className="font-medium text-on-surface">{cleanFinish}</span>
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t sm:border-0 pt-2 sm:pt-0">
                                          <div className="text-left sm:text-right">
                                            <p className="text-xs text-on-surface-variant">
                                              ₹{item.price.toFixed(2)} × {item.quantity}
                                            </p>
                                            <p className="text-sm font-bold text-on-surface mt-0.5">
                                              ₹{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                          </div>

                                          {storagePath && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadModel(storagePath, item.name);
                                              }}
                                              disabled={downloadingPath === storagePath}
                                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full gradient-primary text-white text-xs font-semibold hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              {downloadingPath === storagePath ? (
                                                <>
                                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                  Signing...
                                                </>
                                              ) : (
                                                <>
                                                  <Download className="w-3.5 h-3.5" />
                                                  Download STL
                                                </>
                                              )}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
