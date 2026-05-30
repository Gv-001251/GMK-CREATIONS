"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/lib/store/admin-store";
import { useProductsStore } from "@/lib/store/products-store";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  BarChart3,
} from "lucide-react";

export default function AdminOverviewPage() {
  const { 
    fetchOrders, 
    getTotalRevenue, 
    getTotalOrders, 
    getAverageOrderValue, 
    getMonthlySales 
  } = useAdminStore();
  const { products, fetchProducts } = useProductsStore();

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

      {/* Sales Chart */}
      <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
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
    </div>
  );
}
