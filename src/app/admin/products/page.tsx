"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useProductsStore } from "@/lib/store/products-store";
import Papa from "papaparse";
import {
  Package,
  Edit3,
  Check,
  X,
  Plus,
  Upload,
  Trash2,
  Search,
  Star,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function AdminProductsPage() {
  const { products, fetchProducts, updatePrice, addProduct, removeProduct } = useProductsStore();
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch("/api/products/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(results.data),
          });
          
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to import");
          }
          
          const data = await res.json();
          alert(`Successfully imported ${data.count} products!`);
          fetchProducts();
        } catch (err: any) {
          console.error(err);
          alert(`Error importing CSV: ${err.message}`);
        }
        e.target.value = '';
      },
      error: (error: any) => {
        alert(`Error parsing CSV: ${error.message}`);
        e.target.value = '';
      }
    });
  };

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

    const validFiles: File[] = [];
    const errors: string[] = [];

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

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) handleMultipleImagesUpload(e.dataTransfer.files);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleMultipleImagesUpload(e.target.files);
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

  const removeImageUrl = (index: number) => setImageUrls((prev) => prev.filter((_, i) => i !== index));

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    const slug = newProduct.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
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
      name: "", price: "", category: "miniatures", description: "", longDescription: "",
      materials: "Standard PLA, Resin (8K), Carbon Fiber PETG", finishes: "Matte, Satin, Gloss",
      dimensions: "100mm x 100mm x 100mm", layerHeight: "0.05mm (50 Microns)",
      infillDensity: "20% Gyroid", recommendedApplication: "Display / Prototyping",
      productionDays: "5", badge: "New",
    });
    setImageUrls([]);
    setUploadError("");
    setShowAddForm(false);
  };

  const categories = ["miniatures", "custom-parts", "edc-gear", "decor", "prototypes", "jewelry"];
  const filterCategories = [
    { id: "all", label: "All Products" },
    ...categories.map(cat => ({ id: cat, label: cat.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()) }))
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedFilterCategory === "all" || product.category === selectedFilterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-on-surface tracking-tight">Products</h1>
        <p className="text-on-surface-variant mt-2">Manage your inventory and product listings.</p>
      </div>

      {/* Add Product Button */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-on-surface">
          Product Catalog ({products.length})
        </h3>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container text-on-surface-variant text-sm font-semibold hover:bg-surface-container-high transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleCsvImport} />
          </label>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full gradient-primary text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-sm animate-slide-down">
          <h4 className="font-heading text-lg font-semibold text-on-surface mb-6">
            Create New Product
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Product Name</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm outline-none focus:border-primary transition-all"
                placeholder="e.g., Crystal Dragon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Price (₹)</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm outline-none focus:border-primary transition-all"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm outline-none focus:border-primary transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Short Description</label>
              <input
                type="text"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm outline-none focus:border-primary transition-all"
                placeholder="Short card description"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Long Description</label>
              <textarea
                value={newProduct.longDescription}
                onChange={(e) => setNewProduct({ ...newProduct, longDescription: e.target.value })}
                className="w-full h-32 px-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm outline-none focus:border-primary transition-all resize-none"
                placeholder="Deep detailed description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Materials (Comma separated)</label>
              <input
                type="text"
                value={newProduct.materials}
                onChange={(e) => setNewProduct({ ...newProduct, materials: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm outline-none focus:border-primary transition-all"
                placeholder="e.g. Standard PLA, Resin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Finishes (Comma separated)</label>
              <input
                type="text"
                value={newProduct.finishes}
                onChange={(e) => setNewProduct({ ...newProduct, finishes: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm outline-none focus:border-primary transition-all"
                placeholder="e.g. Matte, Gloss"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Dimensions</label>
              <input
                type="text"
                value={newProduct.dimensions}
                onChange={(e) => setNewProduct({ ...newProduct, dimensions: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm outline-none focus:border-primary transition-all"
                placeholder="e.g. 100mm x 100mm x 100mm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Layer Height</label>
              <input
                type="text"
                value={newProduct.layerHeight}
                onChange={(e) => setNewProduct({ ...newProduct, layerHeight: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm outline-none focus:border-primary transition-all"
                placeholder="e.g. 0.05mm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Infill Density</label>
              <input
                type="text"
                value={newProduct.infillDensity}
                onChange={(e) => setNewProduct({ ...newProduct, infillDensity: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm outline-none focus:border-primary transition-all"
                placeholder="e.g. 20% Gyroid"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Recommended Application</label>
              <input
                type="text"
                value={newProduct.recommendedApplication}
                onChange={(e) => setNewProduct({ ...newProduct, recommendedApplication: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm outline-none focus:border-primary transition-all"
                placeholder="e.g. Display"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Lead Time (Days)</label>
              <input
                type="number"
                value={newProduct.productionDays}
                onChange={(e) => setNewProduct({ ...newProduct, productionDays: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm outline-none focus:border-primary transition-all"
                placeholder="5"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Promo Badge</label>
              <input
                type="text"
                value={newProduct.badge}
                onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm outline-none focus:border-primary transition-all"
                placeholder="e.g. New / Hot"
              />
            </div>

            {/* Drag & Drop Multi Upload area */}
            <div className="md:col-span-2 space-y-4">
              <label className="block text-sm font-medium text-on-surface-variant">Product Images</label>
              
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center p-10 rounded-2xl border-dashed border-2 border-outline-variant hover:border-primary/50 bg-surface-container cursor-pointer transition-all group relative"
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="p-3 rounded-full bg-surface-container-high mb-4 text-on-surface-variant group-hover:text-primary transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-on-surface">Drag & drop multiple files, or click to browse</span>
                <span className="text-xs text-on-surface-variant mt-2">PNG, JPG, or WEBP up to 5MB each. First image is primary.</span>
              </div>

              {uploadError && (
                <p className="text-xs text-destructive font-medium">{uploadError}</p>
              )}

              {/* Visual Thumbnail Grid */}
              {(imageUrls.length > 0 || uploading) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 p-5 rounded-2xl bg-surface-container border border-outline-variant">
                  {imageUrls.map((url, index) => (
                    <div
                      key={url}
                      className="relative group p-2 rounded-xl border border-outline-variant bg-surface-container-lowest flex flex-col items-center gap-2 hover:border-primary/30 transition-all"
                    >
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                        <Image
                          src={url}
                          alt={`Angle ${index + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-amber-500 text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 shadow-md">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>Primary</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 w-full justify-between px-1">
                        <button
                          onClick={() => moveImage(index, "left")}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface disabled:opacity-30 transition-colors"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeImageUrl(index)}
                          className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveImage(index, "right")}
                          disabled={index === imageUrls.length - 1}
                          className="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface disabled:opacity-30 transition-colors"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {uploading && Array.from({ length: inFlightCount }).map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="relative p-2 rounded-xl border border-outline-variant bg-surface-container-lowest animate-pulse flex flex-col items-center gap-2"
                    >
                      <div className="w-full aspect-square rounded-lg bg-surface-container flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-outline-variant">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2.5 rounded-full bg-surface-container-high text-on-surface text-sm font-medium hover:bg-surface-container-highest transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAddProduct}
              disabled={!newProduct.name || !newProduct.price || uploading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full gradient-primary text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Check className="w-4 h-4" />
              Save Product
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-11 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm outline-none focus:border-primary transition-all"
            placeholder="Search products..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {filterCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilterCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedFilterCategory === cat.id
                  ? "gradient-primary text-white"
                  : "bg-surface-container text-on-surface-variant border border-outline-variant hover:border-primary hover:text-primary"
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
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
              <Package className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm font-medium">No products match your criteria.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container">
                  <th className="py-4 px-6 font-semibold text-on-surface-variant">Product</th>
                  <th className="py-4 px-6 font-semibold text-on-surface-variant">Category</th>
                  <th className="py-4 px-6 font-semibold text-right text-on-surface-variant">Price</th>
                  <th className="py-4 px-6 font-semibold text-center text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-outline-variant last:border-0 hover:bg-surface-container/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container border border-outline-variant flex-shrink-0">
                          <Image
                            src={product.image || "/images/products/organic-sculptures.png"}
                            alt={product.name}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface">{product.name}</p>
                          <p className="text-xs text-on-surface-variant mt-1 max-w-xs truncate">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full bg-surface-container border border-outline-variant text-xs font-semibold text-on-surface-variant">
                        {product.category.replace("-", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {editingId === product.id ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-24 px-3 py-1.5 rounded-lg bg-surface-container border border-primary text-on-surface text-sm outline-none text-right"
                          step="0.01"
                          min="0"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSavePrice(product.id);
                            if (e.key === "Escape") { setEditingId(null); setEditPrice(""); }
                          }}
                        />
                      ) : (
                        <span className="font-heading font-bold text-on-surface">
                          ₹{product.price.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {editingId === product.id ? (
                          <>
                            <button
                              onClick={() => handleSavePrice(product.id)}
                              className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setEditPrice(""); }}
                              className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(product.id);
                                setEditPrice(product.price.toFixed(2));
                              }}
                              className="p-2 rounded-xl bg-surface-container border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-on-surface transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="p-2 rounded-xl bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
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
