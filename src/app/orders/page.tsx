"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthGuard } from "@/components/auth-guard";
import { toast } from "@/components/toast";
import { ShoppingBag, ChevronDown, ChevronUp, Package, Calendar, Tag, ShieldCheck, Truck, ClipboardCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface OrderItem {
  id: number;
  order_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  material?: string;
  finish?: string;
  image?: string;
}

interface Order {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  grand_total: number;
  shipping_first_name?: string;
  shipping_last_name?: string;
  shipping_email?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  created_at: string;
  items: OrderItem[];
  razorpay_order_id?: string | null;
}

export default function MyOrdersPage() {
  return (
    <AuthGuard>
      <Navbar />
      <OrdersContent />
      <Footer />
    </AuthGuard>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const fetchUserOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) {
        throw new Error("Failed to fetch order history.");
      }
      const data = await res.json();
      setOrders(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    const confirmCancel = confirm("Are you sure you want to cancel this order? This action cannot be undone.");
    if (!confirmCancel) return;

    setCancellingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order.");
      }

      await fetchUserOrders();
      if (data.refundStatus === "failed") {
        toast.info("Order cancelled. Refund will be processed manually within 2-3 business days.");
      } else {
        toast.success("Order cancelled successfully!");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setCancellingOrderId(null);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
      confirmed: "bg-blue-500/10 text-blue-500 ring-blue-500/20",
      shipped: "bg-indigo-500/10 text-indigo-500 ring-indigo-500/20",
      delivered: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
      cancelled: "bg-rose-500/10 text-rose-500 ring-rose-500/20",
    };

    const statusStyle = statusStyles[status.toLowerCase()] || "bg-surface-container text-on-surface-variant ring-outline-variant";

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ring-1 ${statusStyle}`}>
        {status.toLowerCase() === "delivered" && <ShieldCheck className="w-3.5 h-3.5" />}
        {status.toLowerCase() === "shipped" && <Truck className="w-3.5 h-3.5" />}
        {status.toLowerCase() === "confirmed" && <ClipboardCheck className="w-3.5 h-3.5" />}
        <span>{status}</span>
      </span>
    );
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <span className="text-xs font-medium text-primary uppercase tracking-widest">
            Order History
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-on-surface mt-2 tracking-tight">
            My Orders
          </h1>
          <p className="text-on-surface-variant mt-2 leading-relaxed">
            Track and review your custom 3D prints, prototypes, and past orders.
          </p>
        </div>

        {isLoading ? (
          /* Premium loading skeleton list */
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 rounded-3xl bg-surface-container-low/40 border border-outline-variant animate-pulse">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/60">
                  <div className="h-6 w-48 rounded bg-surface-container" />
                  <div className="h-6 w-24 rounded bg-surface-container" />
                </div>
                <div className="py-6 flex gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-surface-container" />
                  <div className="flex-1 space-y-2 py-2">
                    <div className="h-4 w-40 rounded bg-surface-container" />
                    <div className="h-3 w-24 rounded bg-surface-container" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-center">
            <p className="text-sm font-semibold text-rose-500">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          /* Modern Empty State */
          <div className="flex flex-col items-center justify-center text-center p-12 py-20 rounded-3xl bg-surface-container-low/30 border border-outline-variant shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-6 text-on-surface-variant">
              <ShoppingBag className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="font-heading text-xl font-bold text-on-surface">No orders found</h3>
            <p className="text-on-surface-variant text-sm mt-2 max-w-sm leading-relaxed">
              Looks like you haven&apos;t placed any orders yet. Explore our custom models or upload your own 3D design to get started!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link
                href="/products"
                className="px-6 py-3 rounded-full gradient-primary text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                Browse Catalog
              </Link>
              <Link
                href="/upload"
                className="px-6 py-3 rounded-full bg-surface-container text-on-surface-variant font-semibold text-sm hover:bg-surface-container-high transition-all"
              >
                Upload a 3D File
              </Link>
            </div>
          </div>
        ) : (
          /* Premium Order Cards */
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrders[order.id];
              const dateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={order.id}
                  className="rounded-3xl bg-surface-container-low/40 border border-outline-variant overflow-hidden hover:border-primary/20 hover:bg-surface-container-low/60 transition-all duration-300 shadow-sm"
                >
                  {/* Card Header Summary */}
                  <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-container-low/30 border-b border-outline-variant/50">
                    <div className="grid grid-cols-2 md:flex md:items-center md:gap-8 gap-y-4">
                      {/* Order Ref */}
                      <div>
                        <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Order ID</span>
                        <div className="font-heading font-extrabold text-on-surface text-sm md:text-base mt-0.5">
                          {order.id}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-surface-container mt-0.5">
                          <Calendar className="w-4 h-4 text-on-surface-variant" />
                        </div>
                        <div>
                          <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Placed On</span>
                          <p className="font-semibold text-on-surface text-sm mt-0.5">{dateStr}</p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-surface-container mt-0.5">
                          <Tag className="w-4 h-4 text-on-surface-variant" />
                        </div>
                        <div>
                          <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Total</span>
                          <p className="font-extrabold text-primary text-sm mt-0.5">₹{Number(order.grand_total).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status & Expander */}
                    <div className="flex items-center justify-between md:justify-end gap-4 border-t border-outline-variant/40 pt-4 md:border-none md:pt-0">
                      {getStatusBadge(order.status)}

                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="p-2.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
                        aria-label={isExpanded ? "Collapse Details" : "Expand Details"}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary Item Preview (Always Visible when collapsed) */}
                  {!isExpanded && order.items && order.items.length > 0 && (
                    <div className="p-6 flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/60 shrink-0 flex items-center justify-center">
                        {order.items[0].image ? (
                          <Image
                            src={order.items[0].image || "/images/products/organic-sculptures.png"}
                            alt={order.items[0].name}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover"
                            unoptimized={order.items[0].image.startsWith("http") || order.items[0].image.startsWith("data:")}
                          />
                        ) : (
                          <Package className="w-6 h-6 text-on-surface-variant/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-on-surface truncate">
                          {order.items[0].name}
                        </h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {order.items[0].material} • {order.items[0].finish}
                        </p>
                      </div>
                      {order.items.length > 1 && (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant">
                          +{order.items.length - 1} more item{order.items.length > 2 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Detailed Order Expansion */}
                  {isExpanded && (
                    <div className="p-6 md:p-8 bg-surface-container-lowest/30 animate-fade-in border-t border-outline-variant/20">
                      <h3 className="font-heading text-base font-bold text-on-surface mb-4">
                        Order Items
                      </h3>

                      {/* Items List */}
                      <div className="divide-y divide-outline-variant/40">
                        {order.items.map((item) => (
                          <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* Thumb */}
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/50 shrink-0 flex items-center justify-center">
                              {item.image ? (
                                <Image
                                  src={item.image || "/images/products/organic-sculptures.png"}
                                  alt={item.name}
                                  width={100}
                                  height={100}
                                  className="w-full h-full object-cover"
                                  unoptimized={item.image.startsWith("http") || item.image.startsWith("data:")}
                                />
                              ) : (
                                <Package className="w-8 h-8 text-on-surface-variant/40" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-on-surface">
                                {item.name}
                              </h4>
                              {item.material && (
                                <p className="text-xs text-on-surface-variant mt-1">
                                  <span className="font-medium text-on-surface-variant/80">Material:</span> {item.material}
                                </p>
                              )}
                              {item.finish && (
                                <p className="text-xs text-on-surface-variant mt-0.5">
                                  <span className="font-medium text-on-surface-variant/80">Finish:</span> {item.finish}
                                </p>
                              )}
                            </div>

                            {/* Quantities & Pricing */}
                            <div className="flex items-center justify-between sm:justify-end sm:gap-12 w-full sm:w-auto border-t border-outline-variant/30 pt-3 sm:border-none sm:pt-0">
                              <div className="text-left sm:text-right">
                                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block">Quantity</span>
                                <span className="text-sm font-semibold text-on-surface mt-0.5 block">{item.quantity}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block">Subtotal</span>
                                <span className="text-sm font-extrabold text-on-surface mt-0.5 block">₹{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Info blocks: Shipping + Payment */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-outline-variant/40">
                        {/* Shipping Info */}
                        <div className="p-5 rounded-2xl bg-surface-container-low/40 border border-outline-variant/40">
                          <h4 className="font-heading text-sm font-bold text-on-surface mb-3">
                            Shipping Details
                          </h4>
                          {order.shipping_first_name ? (
                            <div className="text-xs text-on-surface-variant space-y-1.5">
                              <p className="font-semibold text-on-surface">
                                {order.shipping_first_name} {order.shipping_last_name}
                              </p>
                              <p>{order.shipping_address}</p>
                              <p>
                                {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                              </p>
                              <p className="pt-1 text-[10px] text-on-surface-variant/60 font-semibold">{order.shipping_email}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-on-surface-variant/60">No shipping information available.</p>
                          )}
                        </div>

                        {/* Payment / Cost Summary */}
                        <div className="p-5 rounded-2xl bg-surface-container-low/40 border border-outline-variant/40 flex flex-col justify-between">
                          <h4 className="font-heading text-sm font-bold text-on-surface mb-3">
                            Cost Summary
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-on-surface-variant">Subtotal</span>
                              <span className="font-medium text-on-surface">₹{Number(order.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-on-surface-variant">Shipping Fee</span>
                              <span className="font-medium text-on-surface">₹{Number(order.shipping_cost).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold pt-2 border-t border-outline-variant/40">
                              <span className="text-on-surface">Grand Total</span>
                              <span className="text-primary text-sm">₹{Number(order.grand_total).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cancel Order Action Bar */}
                      {(order.status.toLowerCase() === "pending" || order.status.toLowerCase() === "confirmed") && (
                        <div className="mt-6 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 mt-0.5 shrink-0">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <h5 className="text-xs font-bold text-rose-500">Need to cancel this order?</h5>
                              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                                {order.razorpay_order_id ? (
                                  `Since you have paid online, cancelling this order will automatically initiate a full refund of ₹${Number(order.grand_total).toFixed(2)} back to your original payment method via Razorpay.`
                                ) : (
                                  "As a Cash on Delivery order, you can cancel this order before it is processed or shipped."
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingOrderId === order.id}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-rose-500 text-white font-semibold text-xs hover:bg-rose-600 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all hover:shadow-lg hover:shadow-rose-500/10 flex items-center justify-center gap-1.5 shrink-0"
                          >
                            {cancellingOrderId === order.id ? (
                              <>
                                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                                Cancelling...
                              </>
                            ) : (
                              "Cancel Order"
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
