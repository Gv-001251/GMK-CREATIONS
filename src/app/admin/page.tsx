"use client";

import { useState, useEffect } from "react";
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
  Upload,
  Trash2,
  Search,
  Star,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

type Tab = "overview" | "products" | "orders";

function AdminContent() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { fetchOrders } = useAdminStore();
  const { fetchProducts } = useProductsStore();

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [fetchOrders, fetchProducts]);

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
  const { products } = useProductsStore();

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
      value: `₹${avgOrder.toFixed(2)}`,
      icon: TrendingUp,
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Products Listed",
      value: products.length.toString(),
      icon: Package,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      label: "Inventory Valuation",
      value: `₹${totalValuation.toFixed(2)}`,
      icon: Package,
      color: "bg-blue-500/10 text-blue-600",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
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
                    ₹{item.revenue.toFixed(0)}
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
  const { products, updatePrice, addProduct, removeProduct } = useProductsStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "miniatures",
    description: "",
    longDescription: "",
    materials: "Standard PLA, Resin (8K), Carbon Fiber PETG",
    finishes: "Matte, Satin, Gloss",
    dimensions: "100mm x 100mm x 100mm",
    layerHeight: "0.05mm (50 Microns)",
    infillDensity: "20% Gyroid",
    recommendedApplication: "Display / Prototyping",
    productionDays: "5",
    badge: "New",
  });
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [inFlightCount, setInFlightCount] = useState(0);
  const [uploadError, setUploadError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("all");

  const handleSavePrice = (productId: string) => {
    const price = parseFloat(editPrice);
    if (!isNaN(price) && price > 0) {
      updatePrice(productId, price);
    }
    setEditingId(null);
    setEditPrice("");
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to delete "${productName}"?`)) {
      removeProduct(productId);
    }
  };

  const handleMultipleImagesUpload = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    // Validate files
    const validFiles: File[] = [];
    let errors: string[] = [];

    fileList.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`"${file.name}" exceeds the 5MB limit`);
      } else if (!file.type.startsWith("image/")) {
        errors.push(`"${file.name}" is not an image`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setUploadError(errors.join(". "));
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    setInFlightCount(validFiles.length);

    // Upload files in parallel
    const uploadPromises = validFiles.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/products/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await res.json();
        return data.url as string;
      } catch (err) {
        console.error(err);
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUrls = results.filter((url): url is string => url !== null);
      
      setImageUrls((prev) => [...prev, ...successfulUrls]);
      
      if (successfulUrls.length < validFiles.length) {
        setUploadError((prev) => 
          (prev ? prev + ". " : "") + 
          `Some images failed to upload (${validFiles.length - successfulUrls.length} failed)`
        );
      }
    } catch (err) {
      setUploadError("An error occurred during multi-upload.");
    } finally {
      setUploading(false);
      setInFlightCount(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleMultipleImagesUpload(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleMultipleImagesUpload(e.target.files);
    }
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    const nextIndex = direction === "left" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= imageUrls.length) return;

    const newUrls = [...imageUrls];
    const temp = newUrls[index];
    newUrls[index] = newUrls[nextIndex];
    newUrls[nextIndex] = temp;
    setImageUrls(newUrls);
  };

  const setAsPrimary = (index: number) => {
    if (index === 0) return;
    const newUrls = [...imageUrls];
    const primaryUrl = newUrls.splice(index, 1)[0];
    setImageUrls([primaryUrl, ...newUrls]);
  };

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;

    const slug = newProduct.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    
    // Parse materials and finishes from comma-separated string
    const materialsArray = newProduct.materials.split(",").map(s => s.trim()).filter(Boolean);
    const finishesArray = newProduct.finishes.split(",").map(s => s.trim()).filter(Boolean);

    await addProduct({
      id: `custom-${Date.now()}`,
      name: newProduct.name,
      slug,
      description: newProduct.description || "Custom 3D printed product",
      longDescription: newProduct.longDescription || "A custom product added by the admin.",
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      image: imageUrls[0] || "/images/products/organic-sculptures.png",
      images: imageUrls.length > 0 ? imageUrls : ["/images/products/organic-sculptures.png"],
      materials: materialsArray.length > 0 ? materialsArray : ["Standard PLA", "Resin (8K)"],
      finishes: finishesArray.length > 0 ? finishesArray : ["Matte", "Gloss"],
      dimensions: newProduct.dimensions || "Custom",
      layerHeight: newProduct.layerHeight || "0.1mm (100 Microns)",
      infillDensity: newProduct.infillDensity || "20% Gyroid",
      recommendedApplication: newProduct.recommendedApplication || "General",
      productionDays: parseInt(newProduct.productionDays) || 5,
      isNew: true,
      badge: newProduct.badge || "New",
    });

    setNewProduct({
      name: "",
      price: "",
      category: "miniatures",
      description: "",
      longDescription: "",
      materials: "Standard PLA, Resin (8K), Carbon Fiber PETG",
      finishes: "Matte, Satin, Gloss",
      dimensions: "100mm x 100mm x 100mm",
      layerHeight: "0.05mm (50 Microns)",
      infillDensity: "20% Gyroid",
      recommendedApplication: "Display / Prototyping",
      productionDays: "5",
      badge: "New",
    });
    setImageUrls([]);
    setUploadError("");
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

  const filterCategories = [
    { id: "all", label: "All Products" },
    { id: "miniatures", label: "Miniatures" },
    { id: "custom-parts", label: "Custom Parts" },
    { id: "edc-gear", label: "EDC Gear" },
    { id: "decor", label: "Decor" },
    { id: "prototypes", label: "Prototypes" },
    { id: "jewelry", label: "Jewelry" },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedFilterCategory === "all" || product.category === selectedFilterCategory;
    return matchesSearch && matchesCategory;
  });

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
                Price (₹)
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
                Short Description
              </label>
              <input
                type="text"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Short card description"
                id="new-product-description"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Long Description (Detailed specs and overview)
              </label>
              <textarea
                value={newProduct.longDescription}
                onChange={(e) => setNewProduct({ ...newProduct, longDescription: e.target.value })}
                className="w-full h-24 px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Deep detailed description..."
                id="new-product-long-description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Customizable Materials (Comma separated)
              </label>
              <input
                type="text"
                value={newProduct.materials}
                onChange={(e) => setNewProduct({ ...newProduct, materials: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="e.g. Standard PLA, Resin (8K), Carbon Fiber PETG"
                id="new-product-materials"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Customizable Finishes (Comma separated)
              </label>
              <input
                type="text"
                value={newProduct.finishes}
                onChange={(e) => setNewProduct({ ...newProduct, finishes: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="e.g. Matte, Satin, Gloss"
                id="new-product-finishes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Dimensions
              </label>
              <input
                type="text"
                value={newProduct.dimensions}
                onChange={(e) => setNewProduct({ ...newProduct, dimensions: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="e.g. 100mm x 100mm x 100mm"
                id="new-product-dimensions"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Layer Height
              </label>
              <input
                type="text"
                value={newProduct.layerHeight}
                onChange={(e) => setNewProduct({ ...newProduct, layerHeight: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="e.g. 0.05mm (50 Microns)"
                id="new-product-layer-height"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Infill Density
              </label>
              <input
                type="text"
                value={newProduct.infillDensity}
                onChange={(e) => setNewProduct({ ...newProduct, infillDensity: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="e.g. 20% Gyroid"
                id="new-product-infill-density"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Recommended Application
              </label>
              <input
                type="text"
                value={newProduct.recommendedApplication}
                onChange={(e) => setNewProduct({ ...newProduct, recommendedApplication: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="e.g. Display / Collection"
                id="new-product-application"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Production Lead Time (Days)
              </label>
              <input
                type="number"
                value={newProduct.productionDays}
                onChange={(e) => setNewProduct({ ...newProduct, productionDays: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="5"
                min="1"
                id="new-product-production-days"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Promo Badge
              </label>
              <input
                type="text"
                value={newProduct.badge}
                onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="e.g. New / Hot"
                id="new-product-badge"
              />
            </div>

            {/* Drag & Drop Multi Upload area */}
            <div className="md:col-span-2 space-y-4">
              <label className="block text-sm font-medium text-on-surface">
                Product Images (Upload multi angles)
              </label>
              
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center p-8 rounded-2xl border-dashed border-2 border-outline-variant hover:border-primary/50 bg-surface-container-low/40 hover:bg-surface-container-low/60 backdrop-blur-md cursor-pointer transition-all group relative"
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="new-product-images-input"
                />
                <div className="p-3 rounded-full bg-surface-container mb-3 text-on-surface-variant group-hover:text-primary transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-on-surface">Drag & drop multiple files, or click to browse</span>
                <span className="text-xs text-on-surface-variant mt-1">PNG, JPG, or WEBP up to 5MB each. First image becomes primary catalog thumbnail.</span>
              </div>

              {uploadError && (
                <p className="text-xs text-destructive font-medium">{uploadError}</p>
              )}

              {/* Visual Thumbnail Grid */}
              {(imageUrls.length > 0 || uploading) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 rounded-2xl bg-surface-container-low/30 border border-outline-variant">
                  {imageUrls.map((url, index) => (
                    <div
                      key={url}
                      className="relative group p-2 rounded-2xl border border-outline-variant bg-surface-container-low/40 backdrop-blur-md flex flex-col items-center gap-2 hover:border-primary/30 transition-all"
                    >
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-surface-container border border-outline-variant flex-shrink-0">
                        <img
                          src={url}
                          alt={`Angle ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-amber-500 text-white px-1.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 shadow-md">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>Primary</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-1 w-full justify-between px-1">
                        <button
                          onClick={() => moveImage(index, "left")}
                          disabled={index === 0}
                          className="p-1 rounded bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move Left"
                          type="button"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setAsPrimary(index)}
                          disabled={index === 0}
                          className={`p-1 rounded transition-colors ${
                            index === 0
                              ? "bg-amber-500/10 text-amber-600 cursor-default"
                              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-amber-500"
                          }`}
                          title="Set as Primary"
                          type="button"
                        >
                          <Star className={`w-3 h-3 ${index === 0 ? "fill-current" : ""}`} />
                        </button>
                        <button
                          onClick={() => moveImage(index, "right")}
                          disabled={index === imageUrls.length - 1}
                          className="p-1 rounded bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move Right"
                          type="button"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeImageUrl(index)}
                          className="p-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                          title="Delete"
                          type="button"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Skeletons in Flight */}
                  {uploading && Array.from({ length: inFlightCount }).map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="relative p-2 rounded-2xl border border-outline-variant/50 bg-surface-container-low/20 animate-pulse flex flex-col items-center gap-2"
                    >
                      <div className="w-24 h-24 rounded-xl bg-surface-container flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      </div>
                      <div className="h-6 w-20 rounded bg-surface-container/60" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleAddProduct}
              disabled={!newProduct.name || !newProduct.price || uploading}
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

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface text-sm outline-none border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            placeholder="Search products by name or description..."
            id="admin-search-products"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filters Capsules */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {filterCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilterCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedFilterCategory === cat.id
                  ? "gradient-primary text-white shadow-sm"
                  : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
              <Package className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm font-medium">No products match your search or filter criteria.</p>
            </div>
          ) : (
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
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-low/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-container border border-outline-variant flex-shrink-0">
                          <img
                            src={product.image || "/images/products/organic-sculptures.png"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-on-surface">{product.name}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5">{product.description}</p>
                        </div>
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
                          ₹{product.price.toFixed(2)}
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
                        <div className="flex items-center justify-center gap-2">
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
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-on-surface-variant"
                            aria-label={`Delete ${product.name}`}
                            id={`delete-product-${product.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Orders Tab ─── */
function OrdersTab() {
  const { getRecentOrders, updateOrderStatus, isLoading } = useAdminStore();
  const orders = getRecentOrders(50);

  const statusColors: Record<string, string> = {
    pending: "bg-gray-500/10 text-gray-600",
    confirmed: "bg-blue-500/10 text-blue-600",
    processing: "bg-amber-500/10 text-amber-600",
    shipped: "bg-purple-500/10 text-purple-600",
    delivered: "bg-emerald-500/10 text-emerald-600",
  };

  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

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
                      <p className="font-medium text-on-surface">{order.user_name}</p>
                      <p className="text-xs text-on-surface-variant">{order.user_email}</p>
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
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize outline-none cursor-pointer transition-colors ${
                          statusColors[order.status] || ""
                        }`}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-on-surface-variant">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
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
