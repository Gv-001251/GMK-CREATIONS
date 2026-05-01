"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { AuthGuard } from "@/components/auth-guard";
import { useAdminStore } from "@/lib/store/admin-store";
import { useProductsStore } from "@/lib/store/products-store";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  Edit3,
  Check,
  X,
  Plus,
  BarChart3,
  ClipboardList,
  Layers,
} from "lucide-react";

type Tab = "overview" | "products" | "orders";

function AdminContent() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: BarChart3 },
    { id: "products" as Tab, label: "Products", icon: Layers },
    { id: "orders" as Tab, label: "Orders", icon: ClipboardList },
  ];

  return (
    <main>
      <Navbar />

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-heading text-4xl font-bold text-on-surface tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-on-surface-variant mt-2">
              Manage products, view sales analytics, and track orders.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mb-10 border-b border-outline-variant pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "gradient-primary text-white"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "products" && <ProductsTab />}
          {activeTab === "orders" && <OrdersTab />}
        </div>
      </div>
    </main>
  );
}

/* ─── Overview Tab ─── */
function OverviewTab() {
  const { getTotalRevenue, getTotalOrders, getAverageOrderValue, getMonthlySales } =
    useAdminStore();

  const totalRevenue = getTotalRevenue();
  const totalOrders = getTotalOrders();
  const avgOrder = getAverageOrderValue();
  const monthlySales = getMonthlySales();

  const maxRevenue = Math.max(...monthlySales.map((m) => m.revenue), 1);

  const stats = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingBag,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Avg Order Value",
      value: `$${avgOrder.toFixed(2)}`,
      icon: TrendingUp,
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Products Listed",
      value: useProductsStore.getState().products.length.toString(),
      icon: Package,
      color: "bg-purple-500/10 text-purple-600",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-on-surface-variant font-medium">
                {stat.label}
              </span>
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
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
        <h3 className="font-heading text-lg font-bold text-on-surface mb-6">
          Monthly Sales
        </h3>
        {totalOrders === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <BarChart3 className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm">No sales data yet. Orders will appear here.</p>
          </div>
        ) : (
          <div className="flex items-end gap-4 h-64">
            {monthlySales.map((item) => {
              const heightPercent = (item.revenue / maxRevenue) * 100;
              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span className="text-xs font-medium text-on-surface">
                    ${item.revenue.toFixed(0)}
                  </span>
                  <div className="w-full relative" style={{ height: "200px" }}>
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[48px] rounded-t-xl gradient-primary transition-all duration-500"
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-on-surface-variant">
                      {item.month.split(" ")[0]}
                    </span>
                    <p className="text-[10px] text-on-surface-variant/60">
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

/* ─── Products Tab ─── */
function ProductsTab() {
  const { products, updatePrice, addProduct } = useProductsStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "miniatures",
    description: "",
  });

  const handleSavePrice = (productId: string) => {
    const price = parseFloat(editPrice);
    if (!isNaN(price) && price > 0) {
      updatePrice(productId, price);
    }
    setEditingId(null);
    setEditPrice("");
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;

    const slug = newProduct.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    addProduct({
      id: `custom-${Date.now()}`,
      name: newProduct.name,
      slug,
      description: newProduct.description || "Custom 3D printed product",
      longDescription: newProduct.description || "A custom product added by the admin.",
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      image: "/images/products/organic-sculptures.png",
      images: ["/images/products/organic-sculptures.png"],
      materials: ["Standard PLA", "Resin (8K)"],
      finishes: ["Matte", "Gloss"],
      dimensions: "Custom",
      layerHeight: "0.1mm (100 Microns)",
      infillDensity: "50% Grid",
      recommendedApplication: "General",
      productionDays: 5,
      isNew: true,
      badge: "New",
    });

    setNewProduct({ name: "", price: "", category: "miniatures", description: "" });
    setShowAddForm(false);
  };

  const categories = [
    "miniatures",
    "custom-parts",
    "edc-gear",
    "decor",
    "prototypes",
    "jewelry",
  ];

  return (
    <div className="space-y-6">
      {/* Add Product Button */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-on-surface">
          Product Catalog ({products.length})
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full gradient-primary text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-primary/20 shadow-sm animate-slide-down">
          <h4 className="font-heading text-base font-semibold text-on-surface mb-4">
            New Product
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Product Name
              </label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="e.g., Crystal Dragon"
                id="new-product-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Price ($)
              </label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="0.00"
                step="0.01"
                min="0"
                id="new-product-price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Category
              </label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                id="new-product-category"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Short description"
                id="new-product-description"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleAddProduct}
              disabled={!newProduct.name || !newProduct.price}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full gradient-primary text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              id="submit-new-product"
            >
              <Check className="w-4 h-4" />
              Add Product
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2.5 rounded-full bg-surface-container text-on-surface-variant text-sm font-medium hover:bg-surface-container-high transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="text-left py-4 px-6 font-semibold text-on-surface">Product</th>
                <th className="text-left py-4 px-6 font-semibold text-on-surface">Category</th>
                <th className="text-right py-4 px-6 font-semibold text-on-surface">Price</th>
                <th className="text-center py-4 px-6 font-semibold text-on-surface">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-low/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-on-surface">{product.name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{product.description}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-medium text-on-surface-variant">
                      {product.category.replace("-", " ")}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-24 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 text-right"
                        step="0.01"
                        min="0"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSavePrice(product.id);
                          if (e.key === "Escape") {
                            setEditingId(null);
                            setEditPrice("");
                          }
                        }}
                      />
                    ) : (
                      <span className="font-heading font-bold text-on-surface">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {editingId === product.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleSavePrice(product.id)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                          aria-label="Save price"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditPrice("");
                          }}
                          className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                          aria-label="Cancel edit"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(product.id);
                          setEditPrice(product.price.toFixed(2));
                        }}
                        className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface"
                        aria-label={`Edit ${product.name} price`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Orders Tab ─── */
function OrdersTab() {
  const { getRecentOrders } = useAdminStore();
  const orders = getRecentOrders(20);

  const statusColors: Record<string, string> = {
    confirmed: "bg-blue-500/10 text-blue-600",
    processing: "bg-amber-500/10 text-amber-600",
    shipped: "bg-purple-500/10 text-purple-600",
    delivered: "bg-emerald-500/10 text-emerald-600",
  };

  return (
    <div className="space-y-6">
      <h3 className="font-heading text-lg font-bold text-on-surface">
        Recent Orders ({orders.length})
      </h3>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-surface-container-lowest border border-outline-variant">
          <ClipboardList className="w-12 h-12 text-on-surface-variant/30 mb-4" />
          <p className="text-on-surface-variant text-sm">
            No orders yet. Orders will appear here after customers purchase.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="text-left py-4 px-6 font-semibold text-on-surface">Order ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-on-surface">Customer</th>
                  <th className="text-left py-4 px-6 font-semibold text-on-surface">Items</th>
                  <th className="text-right py-4 px-6 font-semibold text-on-surface">Total</th>
                  <th className="text-center py-4 px-6 font-semibold text-on-surface">Status</th>
                  <th className="text-right py-4 px-6 font-semibold text-on-surface">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-low/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-on-surface font-mono text-xs">
                      {order.id}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-on-surface">{order.userName}</p>
                      <p className="text-xs text-on-surface-variant">{order.userEmail}</p>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="py-4 px-6 text-right font-heading font-bold text-on-surface">
                      ${order.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          statusColors[order.status] || ""
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
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

/* ─── Exported Page ─── */
export default function AdminPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminContent />
    </AuthGuard>
  );
}
