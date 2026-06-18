"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useProductsStore } from "@/lib/store/products-store";
import Papa from "papaparse";
import type { Product } from "@/lib/data/products";
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

const CATEGORIES = ["miniatures", "custom-parts", "edc-gear", "decor", "prototypes", "jewelry"];

const EMPTY_FORM = {
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
  featured: false,
};

export default function AdminProductsPage() {
  const { products, fetchProducts, addProduct, updateProduct, removeProduct } = useProductsStore();
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── CSV Import ──
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

  // ── Form State ──
  // editingProduct holds the original Product being edited; null means "Add" mode
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [inFlightCount, setInFlightCount] = useState(0);
  const [uploadError, setUploadError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("all");

  const isEditMode = editingProduct !== null;

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  // ── Open Add Form ──
  const openAddForm = () => {
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setImageUrls([]);
    setUploadError("");
    setShowForm(true);
  };

  // ── Open Edit Form (pre-populate with product data) ──
  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      longDescription: product.longDescription,
      materials: product.materials.join(", "),
      finishes: product.finishes.join(", "),
      dimensions: product.dimensions,
      layerHeight: product.layerHeight,
      infillDensity: product.infillDensity,
      recommendedApplication: product.recommendedApplication,
      productionDays: product.productionDays.toString(),
      badge: product.badge || "",
      featured: product.featured || false,
    });
    setImageUrls(product.images && product.images.length > 0 ? [...product.images] : product.image ? [product.image] : []);
    setUploadError("");
    setShowForm(true);
  };

  // ── Close Form ──
  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setImageUrls([]);
    setUploadError("");
  };

  // ── Delete ──
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await removeProduct(productId);
        setNotification({ type: "success", message: `"${productName}" deleted successfully!` });
      } catch (err: any) {
        setNotification({ type: "error", message: `Failed to delete: ${err.message}` });
      }
    }
  };

  // ── Image Upload ──
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
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      try {
        const res = await fetch("/api/products/upload-image", {
          method: "POST",
          body: formDataUpload,
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
    } catch {
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

  const makePrimary = (index: number) => {
    if (index <= 0 || index >= imageUrls.length) return;
    const newUrls = [...imageUrls];
    const targetUrl = newUrls[index];
    newUrls.splice(index, 1);
    newUrls.unshift(targetUrl);
    setImageUrls(newUrls);
  };

  const removeImageUrl = (index: number) => setImageUrls((prev) => prev.filter((_, i) => i !== index));

  // ── Save (Add or Update) ──
  const handleSave = async () => {
    if (!formData.name || !formData.price) return;

    const materialsArray = formData.materials.split(",").map(s => s.trim()).filter(Boolean);
    const finishesArray = formData.finishes.split(",").map(s => s.trim()).filter(Boolean);

    setSaving(true);
    try {
      if (isEditMode && editingProduct) {
        // ── UPDATE existing product ──
        const newSlug = formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        await updateProduct(editingProduct.slug, {
          name: formData.name,
          slug: newSlug,
          description: formData.description || "Custom 3D printed product",
          longDescription: formData.longDescription || "A custom product added by the admin.",
          price: parseFloat(formData.price),
          category: formData.category,
          image: imageUrls[0] || editingProduct.image || "/images/products/organic-sculptures.png",
          images: imageUrls.length > 0 ? imageUrls : [editingProduct.image || "/images/products/organic-sculptures.png"],
          materials: materialsArray.length > 0 ? materialsArray : editingProduct.materials,
          finishes: finishesArray.length > 0 ? finishesArray : editingProduct.finishes,
          dimensions: formData.dimensions || editingProduct.dimensions,
          layerHeight: formData.layerHeight || editingProduct.layerHeight,
          infillDensity: formData.infillDensity || editingProduct.infillDensity,
          recommendedApplication: formData.recommendedApplication || editingProduct.recommendedApplication,
          productionDays: parseInt(formData.productionDays) || editingProduct.productionDays,
          badge: formData.badge || undefined,
          featured: formData.featured,
        });

        setNotification({ type: "success", message: `"${formData.name}" updated successfully!` });
      } else {
        // ── CREATE new product ──
        const slug = formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

        await addProduct({
          id: `custom-${Date.now()}`,
          name: formData.name,
          slug,
          description: formData.description || "Custom 3D printed product",
          longDescription: formData.longDescription || "A custom product added by the admin.",
          price: parseFloat(formData.price),
          category: formData.category,
          image: imageUrls[0] || "/images/products/organic-sculptures.png",
          images: imageUrls.length > 0 ? imageUrls : ["/images/products/organic-sculptures.png"],
          materials: materialsArray.length > 0 ? materialsArray : ["Standard PLA", "Resin (8K)"],
          finishes: finishesArray.length > 0 ? finishesArray : ["Matte", "Gloss"],
          dimensions: formData.dimensions || "Custom",
          layerHeight: formData.layerHeight || "0.1mm (100 Microns)",
          infillDensity: formData.infillDensity || "20% Gyroid",
          recommendedApplication: formData.recommendedApplication || "General",
          productionDays: parseInt(formData.productionDays) || 5,
          isNew: true,
          badge: formData.badge || "New",
        });

        setNotification({ type: "success", message: `"${formData.name}" saved to database and is now live!` });
      }

      closeForm();
    } catch (err: any) {
      setNotification({ type: "error", message: `Failed to save product: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  // ── Filtering ──
  const filterCategories = [
    { id: "all", label: "All Products" },
    ...CATEGORIES.map(cat => ({ id: cat, label: cat.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()) }))
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedFilterCategory === "all" || product.category === selectedFilterCategory;
    return matchesSearch && matchesCategory;
  });

  // ── Helper: update a form field ──
  const setField = (field: string, value: string | boolean) => setFormData(prev => ({ ...prev, [field]: value }));

  // ── Shared input class ──
  const inputClass = "w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface text-sm outline-none focus:border-primary transition-all";

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Notification Banner */}
      {notification && (
        <div
          className={`flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-medium animate-slide-down ${
            notification.type === "success"
              ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="p-1 rounded-full hover:bg-black/5 transition-colors ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
            onClick={() => showForm && !isEditMode ? closeForm() : openAddForm()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full gradient-primary text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* ═══════════ Unified Add / Edit Product Form ═══════════ */}
      {showForm && (
        <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-sm animate-slide-down">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-heading text-lg font-semibold text-on-surface">
              {isEditMode ? `Edit: ${editingProduct?.name}` : "Create New Product"}
            </h4>
            {isEditMode && (
              <span className="text-xs text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant font-medium">
                ID: {editingProduct?.id}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setField("name", e.target.value)}
                className={inputClass}
                placeholder="e.g., Crystal Dragon"
              />
            </div>
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Price (₹)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setField("price", e.target.value)}
                className={inputClass}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setField("category", e.target.value)}
                className={inputClass}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Short Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setField("description", e.target.value)}
                className={inputClass}
                placeholder="Short card description"
              />
            </div>
            {/* Long Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Long Description</label>
              <textarea
                value={formData.longDescription}
                onChange={(e) => setField("longDescription", e.target.value)}
                className={`${inputClass} h-32 resize-none`}
                placeholder="Deep detailed description..."
              />
            </div>
            {/* Materials */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Materials (Comma separated)</label>
              <input
                type="text"
                value={formData.materials}
                onChange={(e) => setField("materials", e.target.value)}
                className={inputClass}
                placeholder="e.g. Standard PLA, Resin"
              />
            </div>
            {/* Finishes */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Finishes (Comma separated)</label>
              <input
                type="text"
                value={formData.finishes}
                onChange={(e) => setField("finishes", e.target.value)}
                className={inputClass}
                placeholder="e.g. Matte, Gloss"
              />
            </div>
            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Dimensions</label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => setField("dimensions", e.target.value)}
                className={inputClass}
                placeholder="e.g. 100mm x 100mm x 100mm"
              />
            </div>
            {/* Layer Height */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Layer Height</label>
              <input
                type="text"
                value={formData.layerHeight}
                onChange={(e) => setField("layerHeight", e.target.value)}
                className={inputClass}
                placeholder="e.g. 0.05mm"
              />
            </div>
            {/* Infill Density */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Infill Density</label>
              <input
                type="text"
                value={formData.infillDensity}
                onChange={(e) => setField("infillDensity", e.target.value)}
                className={inputClass}
                placeholder="e.g. 20% Gyroid"
              />
            </div>
            {/* Recommended Application */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Recommended Application</label>
              <input
                type="text"
                value={formData.recommendedApplication}
                onChange={(e) => setField("recommendedApplication", e.target.value)}
                className={inputClass}
                placeholder="e.g. Display"
              />
            </div>
            {/* Lead Time */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Lead Time (Days)</label>
              <input
                type="number"
                value={formData.productionDays}
                onChange={(e) => setField("productionDays", e.target.value)}
                className={inputClass}
                placeholder="5"
                min="1"
              />
            </div>
            {/* Badge */}
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Promo Badge</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setField("badge", e.target.value)}
                className={inputClass}
                placeholder="e.g. New / Hot / Bestseller"
              />
            </div>
            {/* Featured Toggle */}
            <div className="flex items-center gap-3">
              <label className="block text-sm font-medium text-on-surface-variant">Featured Product</label>
              <button
                type="button"
                onClick={() => setField("featured", !formData.featured)}
                className={`relative w-11 h-6 rounded-full transition-colors ${formData.featured ? "bg-primary" : "bg-surface-container-highest"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${formData.featured ? "translate-x-5" : ""}`} />
              </button>
            </div>

            {/* ── Drag & Drop Multi Upload area ── */}
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
                      key={`${url}-${index}`}
                      className="relative group p-2 rounded-xl border border-outline-variant bg-surface-container-lowest flex flex-col items-center gap-2 hover:border-primary/30 transition-all"
                    >
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-surface-container shrink-0">
                        <Image
                          src={url}
                          alt={`Angle ${index + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                          unoptimized={url.startsWith("http") || url.includes("supabase")}
                        />
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-amber-500 text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 shadow-md">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>Primary</span>
                          </div>
                        )}
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => makePrimary(index)}
                            className="absolute top-1 left-1 bg-black/75 hover:bg-amber-500 hover:text-white text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            title="Set as Primary Image"
                          >
                            <Star className="w-2.5 h-2.5" />
                            <span>Set Main</span>
                          </button>
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
          
          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-outline-variant">
            <button
              onClick={closeForm}
              type="button"
              className="px-6 py-2.5 rounded-full bg-surface-container-high text-on-surface text-sm font-medium hover:bg-surface-container-highest transition-all whitespace-nowrap"
            >
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              type="button"
              disabled={!formData.name || !formData.price || uploading || saving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full gradient-primary text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />
                  <span>{isEditMode ? "Saving Changes..." : "Saving to Database..."}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{isEditMode ? "Save Changes" : "Save Product"}</span>
                </>
              )}
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
                    className={`border-b border-outline-variant last:border-0 hover:bg-surface-container/50 transition-colors ${
                      editingProduct?.id === product.id ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : ""
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container border border-outline-variant shrink-0">
                          <Image
                            src={product.image || "/images/products/organic-sculptures.png"}
                            alt={product.name}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover"
                            unoptimized={(product.image || "").startsWith("http") || (product.image || "").includes("supabase")}
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
                      <span className="font-heading font-bold text-on-surface">
                        ₹{product.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditForm(product)}
                          className={`p-2 rounded-xl border transition-colors ${
                            editingProduct?.id === product.id
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-surface-container border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-on-surface"
                          }`}
                          title="Edit product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-2 rounded-xl bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
