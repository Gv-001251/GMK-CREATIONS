"use client";

import { useEffect, useState, Fragment, useMemo } from "react";
import { useAdminStore } from "@/lib/store/admin-store";
import { useRealtimeAdmin } from "@/lib/hooks/use-realtime-admin";
import { ClipboardList, ChevronDown, ChevronUp, FileText, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "@/components/toast";

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

// Derive the original uploaded file name from a storage key by stripping the
// 8-char hex uniqueness prefix (e.g. "3a4b5c6d-model.stl" -> "model.stl").
function uploadedFileName(storagePath: string): string {
  const basename = storagePath.split("/").pop() || storagePath;
  return basename.replace(/^[0-9a-f]{8}-/i, "") || basename;
}

export default function AdminOrdersPage() {
  const { fetchOrders, getRecentOrders, updateOrderStatus, isLoading } = useAdminStore();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Live-update: re-fetch whenever any orders row changes in the DB
  useRealtimeAdmin({ onOrdersChange: fetchOrders });

  const allOrders = useAdminStore((state) => state.orders);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const totalPages = Math.ceil(allOrders.length / ordersPerPage);

  const currentOrders = useMemo(() => {
    const start = (currentPage - 1) * ordersPerPage;
    return allOrders.slice(start, start + ordersPerPage);
  }, [allOrders, currentPage, ordersPerPage]);

  const orders = currentOrders; // Keep alias to avoid rewriting local references


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

  // Delete single order (soft delete — the record is retained in the database)
  const handleDeleteOrderSingle = async (orderId: string) => {
    if (!confirm(`Remove order "${orderId}" from the list? The order record is kept safely in the database and can be restored if needed.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/orders/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: [orderId] }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete order");
      }

      toast.success("Order removed from the list. The record is retained in the database.");
      // Refresh local store
      fetchOrders();
      setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId));
    } catch (err: any) {
      console.error("Order delete error:", err);
      toast.error(`Delete failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete bulk orders
  const handleDeleteOrdersBulk = async () => {
    if (selectedOrderIds.length === 0) return;

    if (!confirm(`Remove the ${selectedOrderIds.length} selected orders from the list? The order records are kept safely in the database and can be restored if needed.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/orders/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedOrderIds }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete selected orders");
      }

      toast.success("Selected orders removed from the list. The records are retained in the database.");
      // Refresh local store
      fetchOrders();
      setSelectedOrderIds([]);
    } catch (err: any) {
      console.error("Bulk orders delete error:", err);
      toast.error(`Bulk delete failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSelectAllOrders = () => {
    const allOrderIds = currentOrders.map((o) => o.id);
    const allSelected = allOrderIds.every((id) => selectedOrderIds.includes(id));

    if (allSelected) {
      setSelectedOrderIds((prev) => prev.filter((id) => !allOrderIds.includes(id)));
    } else {
      setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...allOrderIds])));
    }
  };

  const allOrdersSelected = currentOrders.length > 0 && currentOrders.every((o) => selectedOrderIds.includes(o.id));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-on-surface tracking-tight">Orders</h1>
          <p className="text-on-surface-variant mt-2">
            Manage customer orders and update tracking status. Download custom 3D model files from the Uploads page.
          </p>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedOrderIds.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-destructive/10 border border-destructive/20 animate-slide-down">
          <span className="text-sm font-semibold text-destructive flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
            {selectedOrderIds.length} order{selectedOrderIds.length > 1 ? "s" : ""} selected for removal
          </span>
          <button
            onClick={handleDeleteOrdersBulk}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive text-white text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Delete Selected
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : allOrders.length === 0 ? (
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
                  <th className="py-4 px-6 font-semibold text-on-surface-variant w-10">
                    <input
                      type="checkbox"
                      checked={allOrdersSelected}
                      onChange={handleSelectAllOrders}
                      className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-6 font-semibold text-on-surface-variant w-10"></th>
                  <th className="py-4 px-6 font-semibold text-on-surface-variant">Order ID</th>
                  <th className="py-4 px-6 font-semibold text-on-surface-variant">Customer</th>
                  <th className="py-4 px-6 font-semibold text-on-surface-variant">Items</th>
                  <th className="py-4 px-6 font-semibold text-on-surface-variant">3D Models</th>
                  <th className="py-4 px-6 font-semibold text-right text-on-surface-variant">Total</th>
                  <th className="py-4 px-6 font-semibold text-center text-on-surface-variant">Status</th>
                  <th className="py-4 px-6 font-semibold text-right text-on-surface-variant">Date</th>
                  <th className="py-4 px-6 font-semibold text-right text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const orderStlFiles = order.items
                    .map(item => {
                      const { storagePath } = extractStoragePath(item.finish);
                      return storagePath ? { storagePath, name: item.name } : null;
                    })
                    .filter((f): f is { storagePath: string; name: string } => !!f);

                  return (
                    <Fragment key={order.id}>
                      <tr
                        className={`border-b border-outline-variant last:border-0 hover:bg-surface-container-low/30 transition-colors cursor-pointer ${isExpanded ? 'bg-surface-container-low/20' : ''} ${selectedOrderIds.includes(order.id) ? "bg-primary/5" : ""
                          }`}
                        onClick={() => toggleExpand(order.id)}
                      >
                        <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={() => handleSelectOrder(order.id)}
                            className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <button type="button" className="text-on-surface-variant hover:text-on-surface">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="py-4 px-6 font-medium text-on-surface font-mono text-xs">
                          {order.id}
                        </td>
                        <td className="py-4 px-6 text-on-surface">
                          <div>
                            <p className="font-semibold">{order.shipping_first_name} {order.shipping_last_name}</p>
                            <p className="text-xs text-on-surface-variant">{order.shipping_email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-on-surface">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </td>
                        <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                          {orderStlFiles.length > 0 ? (
                            <div className="flex flex-col gap-1 max-w-[180px]">
                              {orderStlFiles.map((file, idx) => {
                                const fileName = uploadedFileName(file.storagePath);
                                return (
                                  <span
                                    key={idx}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface text-xs font-medium truncate w-full"
                                    title={fileName}
                                  >
                                    <FileText className="w-3 h-3 shrink-0 text-on-surface-variant" />
                                    <span className="truncate">{fileName}</span>
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-xs text-on-surface-variant/40">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right font-heading font-bold text-on-surface">
                          ₹{order.grand_total.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as typeof statuses[number])}
                            className={`px-3 py-1 rounded-full text-xs font-bold border outline-none cursor-pointer transition-all ${statusColors[order.status] || "bg-surface-container text-on-surface-variant"
                              }`}
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status} className="bg-background text-foreground">
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-6 text-right text-on-surface-variant text-xs font-mono">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrderSingle(order.id)}
                            disabled={isDeleting}
                            className="p-2 rounded-xl border border-destructive/20 hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-surface-container-low/10">
                          <td colSpan={10} className="p-6">
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
                                        key={idx}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant gap-4"
                                      >
                                        <div className="flex items-center gap-4">
                                          {item.image && (
                                            <div className="relative w-12 h-12 rounded-lg bg-surface-container-highest border border-outline-variant overflow-hidden shrink-0">
                                              <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                sizes="48px"
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
                                            <div
                                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-container text-on-surface text-xs font-semibold max-w-[220px]"
                                              title={uploadedFileName(storagePath)}
                                            >
                                              <FileText className="w-3.5 h-3.5 shrink-0 text-on-surface-variant" />
                                              <span className="truncate">{uploadedFileName(storagePath)}</span>
                                            </div>
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
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 bg-surface-container-low border-t border-outline-variant">
              <span className="text-sm text-on-surface-variant">
                Page {currentPage} of {totalPages} ({allOrders.length} orders total)
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl bg-surface-container-highest text-on-surface text-xs font-semibold hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl bg-surface-container-highest text-on-surface text-xs font-semibold hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
