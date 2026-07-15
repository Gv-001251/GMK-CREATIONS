"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminStore } from "@/lib/store/admin-store";
import { useProductsStore } from "@/lib/store/products-store";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  BarChart3,
  Download,
  Loader2,
} from "lucide-react";

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

export default function AdminOverviewPage() {
  const { 
    fetchOrders, 
    getTotalRevenue, 
    getTotalOrders, 
    getAverageOrderValue, 
    getMonthlySales,
    getRecentOrders
  } = useAdminStore();
  const { products, fetchProducts } = useProductsStore();
  const [downloadingPath, setDownloadingPath] = useState<string | null>(null);

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
      
      const a = document.createElement("a");
      a.href = signedUrl;
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

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [fetchOrders, fetchProducts]);

  const totalRevenue = getTotalRevenue();
  const totalOrders = getTotalOrders();
  const avgOrder = getAverageOrderValue();
  const monthlySales = getMonthlySales();
  const totalValuation = products.reduce((acc, p) => acc + p.price, 0);

  const maxRevenue = Math.max(...monthlySales.map((m) => m.revenue), 1);

  const stats = [
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingBag,
      color: "bg-primary/10 text-primary border-primary/20",
    },
    {
      label: "Avg Order Value",
      value: `₹${avgOrder.toFixed(2)}`,
      icon: TrendingUp,
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    {
      label: "Products Listed",
      value: products.length.toString(),
      icon: Package,
      color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    },
    {
      label: "Inventory Valuation",
      value: `₹${totalValuation.toFixed(2)}`,
      icon: Package,
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-on-surface tracking-tight mb-8">Admin Overview</h1>
        <p className="text-on-surface-variant mt-2">Welcome to your store&apos;s control center.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-on-surface-variant font-semibold">
                {stat.label}
              </span>
              <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="font-heading text-2xl font-bold text-on-surface">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

        {/* Sales Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant">
          <h3 className="font-heading text-lg font-bold text-on-surface mb-8">
            Monthly Revenue
          </h3>
          {totalOrders === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
              <BarChart3 className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm font-medium">No sales data yet. Orders will appear here.</p>
            </div>
          ) : (
            <div className="flex items-end gap-6 h-72">
              {monthlySales.map((item) => {
                const heightPercent = (item.revenue / maxRevenue) * 100;
                return (
                  <div
                    key={item.month}
                    className="flex-1 flex flex-col items-center gap-3 group"
                  >
                    <span className="text-xs font-bold text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{item.revenue.toFixed(0)}
                    </span>
                    <div className="w-full relative bg-surface-container rounded-t-xl overflow-hidden" style={{ height: "220px" }}>
                      <div
                        className="absolute bottom-0 left-0 w-full gradient-primary transition-all duration-500 ease-out group-hover:brightness-110"
                        style={{ height: `${Math.max(heightPercent, 2)}%` }}
                      >
                        <div className="absolute inset-0 bg-linear-to-t from-white/10 to-transparent" />
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-semibold text-on-surface-variant">
                        {item.month.split(" ")[0]}
                      </span>
                      <p className="text-[10px] font-medium text-on-surface-variant/60 mt-1">
                        {item.orders} order{item.orders !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant flex flex-col">
          <h3 className="font-heading text-lg font-bold text-on-surface mb-6">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-4 flex-1">
            <Link href="/admin/products" className="flex items-center justify-between p-4 rounded-xl border border-outline-variant hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <div className="flex items-center gap-3 text-on-surface">
                <Package className="w-5 h-5 text-primary" />
                <span className="font-medium">Manage Products</span>
              </div>
              <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">→</span>
            </Link>
            <Link href="/admin/orders" className="flex items-center justify-between p-4 rounded-xl border border-outline-variant hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <div className="flex items-center gap-3 text-on-surface">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span className="font-medium">Manage Orders</span>
              </div>
              <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">→</span>
            </Link>
            <Link href="/" className="flex items-center justify-between p-4 rounded-xl border border-outline-variant hover:border-primary/50 hover:bg-primary/5 transition-all group mt-auto">
              <div className="flex items-center gap-3 text-on-surface">
                <span className="font-medium">View Storefront</span>
              </div>
              <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-lg font-bold text-on-surface">
            Recent Orders
          </h3>
          <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">
            View All
          </Link>
        </div>
        
        {getRecentOrders(5).length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant">
            No recent orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant text-sm text-on-surface-variant">
                  <th className="py-4 px-4 font-medium">Order ID</th>
                  <th className="py-4 px-4 font-medium">Date</th>
                  <th className="py-4 px-4 font-medium">Customer</th>
                  <th className="py-4 px-4 font-medium">3D Models</th>
                  <th className="py-4 px-4 font-medium">Status</th>
                  <th className="py-4 px-4 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {getRecentOrders(5).map((order) => {
                  const date = new Date(order.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  });
                  const orderStlFiles = order.items
                    .map((item) => {
                      const { storagePath } = extractStoragePath(item.finish);
                      return storagePath ? { storagePath, name: item.name } : null;
                    })
                    .filter((f): f is { storagePath: string; name: string } => !!f);

                  return (
                    <tr key={order.id} className="border-b border-outline-variant/50 hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="py-4 px-4 text-sm font-medium text-on-surface font-mono">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="py-4 px-4 text-sm text-on-surface-variant">
                        {date}
                      </td>
                      <td className="py-4 px-4 text-sm text-on-surface-variant">
                        {order.shipping_first_name || 'Guest'} {order.shipping_last_name || ''}
                        <div className="text-xs opacity-70">{order.shipping_email || 'No email provided'}</div>
                      </td>
                      <td className="py-4 px-4">
                        {orderStlFiles.length > 0 ? (
                          <div className="flex flex-col gap-1 max-w-[150px]">
                            {orderStlFiles.map((file, fIdx) => {
                              const cleanName = file.name.replace(/^Custom Print:\s*/i, "");
                              return (
                                <button
                                  key={fIdx}
                                  type="button"
                                  onClick={() => handleDownloadModel(file.storagePath, file.name)}
                                  disabled={downloadingPath === file.storagePath}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-semibold transition-all disabled:opacity-50 text-left truncate w-full"
                                  title={`Download ${file.name}`}
                                >
                                  {downloadingPath === file.storagePath ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin shrink-0" />
                                  ) : (
                                    <Download className="w-2.5 h-2.5 shrink-0" />
                                  )}
                                  <span className="truncate">{cleanName}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-on-surface-variant/40">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : 
                            order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 
                            order.status === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-amber-500/10 text-amber-500'}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-on-surface text-right">
                        ₹{order.grand_total.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
