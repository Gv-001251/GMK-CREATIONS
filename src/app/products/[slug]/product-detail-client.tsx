"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ProductCard } from "@/components/product-card";
import { Footer } from "@/components/footer";
import { useProductsStore } from "@/lib/store/products-store";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { ChevronRight, Minus, Plus, ShoppingCart, Cpu, Ruler, Layers, Maximize2, LogIn, ChevronLeft, X } from "lucide-react";
import { getDeliveryEstimate } from "@/lib/utils/date-estimator";

interface MaterialInfo {
  multiplier: number;
  description: string;
  colorClass: string;
  detail: number;
  strength: number;
  weight: number;
}

interface FinishInfo {
  surcharge: number;
  description: string;
  colorClass: string;
}

const MATERIAL_METADATA: Record<string, MaterialInfo> = {
  "Standard PLA": { multiplier: 1.0, description: "Easy printing, biodegradable thermoplastic", colorClass: "bg-emerald-500", detail: 75, strength: 55, weight: 60 },
  "Resin (8K)": { multiplier: 1.4, description: "Ultra-high resolution, razor-sharp details", colorClass: "bg-teal-500", detail: 98, strength: 45, weight: 70 },
  "Carbon Fiber PETG": { multiplier: 1.25, description: "Extreme rigidity and impact resistance", colorClass: "bg-zinc-700", detail: 80, strength: 95, weight: 50 },
  "Nylon PA12": { multiplier: 1.3, description: "High toughness and chemical resistance", colorClass: "bg-sky-500", detail: 82, strength: 90, weight: 80 },
  "Translucent Resin": { multiplier: 1.4, description: "Clear transparent SLA, semi-gloss premium", colorClass: "bg-cyan-300/60", detail: 96, strength: 45, weight: 70 },
  "UV Resin": { multiplier: 1.4, description: "Fast-curing precision UV photopolymer", colorClass: "bg-purple-500", detail: 98, strength: 40, weight: 70 }
};

const getMaterialInfo = (name: string): MaterialInfo => {
  return MATERIAL_METADATA[name] || { multiplier: 1.0, description: "Premium fabrication material", colorClass: "bg-primary/80", detail: 75, strength: 60, weight: 65 };
};

const FINISH_METADATA: Record<string, FinishInfo> = {
  "Matte": { surcharge: 0, description: "Non-reflective soft sheen", colorClass: "bg-zinc-600 border-zinc-500" },
  "Satin": { surcharge: 50, description: "Soft pearl-like medium gloss", colorClass: "bg-stone-300 border-stone-200" },
  "Gloss": { surcharge: 80, description: "Polished high-gloss smooth surface", colorClass: "bg-slate-100 border-white" },
  "Polished": { surcharge: 150, description: "Hand-sanded shiny smooth finish", colorClass: "bg-zinc-200 border-zinc-100" },
  "Anodized": { surcharge: 250, description: "Metallic protective oxide coat", colorClass: "bg-amber-500 border-amber-400" },
  "Translucent": { surcharge: 50, description: "Light-transmitting clear finish", colorClass: "bg-cyan-100/50 border-cyan-50" },
  "Metallic": { surcharge: 100, description: "Vibrant electroplated metallic luster", colorClass: "bg-yellow-600 border-yellow-500" },
  "Textured": { surcharge: 60, description: "Fine sand-blasted grip texture", colorClass: "bg-neutral-800 border-neutral-700" },
  "Natural White": { surcharge: 0, description: "Unfinished clean white", colorClass: "bg-white border-zinc-200" },
  "Warm Ivory": { surcharge: 20, description: "Warm ivory hue", colorClass: "bg-amber-50/90 border-amber-100" },
  "Cool Grey": { surcharge: 20, description: "Cool modern grey", colorClass: "bg-slate-400 border-slate-300" },
  "Dark Metallic": { surcharge: 120, description: "Glistening gunmetal dark shine", colorClass: "bg-slate-800 border-slate-700" },
  "Bone White": { surcharge: 30, description: "Ornate bone-like warm white", colorClass: "bg-yellow-50 border-yellow-100" },
  "Antique Bronze": { surcharge: 200, description: "Hand-rubbed metallic bronze patina", colorClass: "bg-amber-900 border-amber-800" },
  "Raw": { surcharge: 0, description: "Industrial raw print finish", colorClass: "bg-orange-800 border-orange-700" },
  "Primed": { surcharge: 60, description: "Base-coated paint ready grey", colorClass: "bg-gray-500 border-gray-400" },
  "Paint-Ready": { surcharge: 100, description: "Sanded and primed for acrylics", colorClass: "bg-blue-400 border-blue-300" },
  "Carbon Weave": { surcharge: 220, description: "Carbon fiber pattern finish", colorClass: "bg-zinc-900 border-zinc-800" },
  "Painted": { surcharge: 180, description: "Professional hand-painted coat", colorClass: "bg-red-500 border-red-400" },
  "Natural": { surcharge: 0, description: "Untreated raw natural look", colorClass: "bg-stone-400 border-stone-300" }
};

const getFinishInfo = (name: string): FinishInfo => {
  return FINISH_METADATA[name] || { surcharge: 0, description: "Standard finish", colorClass: "bg-neutral-500 border-neutral-400" };
};

export default function ProductDetailClient() {
  const params = useParams();
  const { fetchProducts, getProductBySlug, getRecommendedProducts, isLoading } = useProductsStore();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const product = mounted ? getProductBySlug(params.slug as string) : undefined;
  const recommended = mounted ? getRecommendedProducts(product?.id) : [];

  const galleryImages = (product?.images && product.images.length > 0)
    ? product.images
    : [product?.image || "/images/products/organic-sculptures.png"];

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, [fetchProducts]);

  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedFinish, setSelectedFinish] = useState("");

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [params.slug]);

  useEffect(() => {
    if (!lightboxOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
      } else if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
      } else if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, galleryImages.length]);

  if (isLoading) {
    return (
      <main>
        <Navbar />
        <div className="pt-32 pb-20 px-6 flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
          <p className="text-on-surface-variant text-sm font-medium animate-pulse">Loading product details...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main>
        <Navbar />
        <div className="pt-32 pb-20 px-6 text-center">
          <h1 className="font-heading text-3xl font-bold">Product Not Found</h1>
          <Link href="/products" className="text-primary mt-4 inline-block hover:underline">
            Back to Catalog
          </Link>
        </div>
      </main>
    );
  }

  const activeMaterial = selectedMaterial || (product.materials[0] || "");
  const activeFinish = selectedFinish || (product.finishes[0] || "");

  const materialInfo = getMaterialInfo(activeMaterial);
  const finishInfo = getFinishInfo(activeFinish);
  const dynamicPrice = (product.price * materialInfo.multiplier) + finishInfo.surcharge;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: dynamicPrice,
      image: product.image,
      material: activeMaterial,
      finish: activeFinish,
      quantity: 1,
    });
  };

  const specs = [
    { icon: Maximize2, label: "Dimensions", value: product.dimensions },
    { icon: Layers, label: "Layer Height", value: product.layerHeight },
    { icon: Cpu, label: "Infill Density", value: product.infillDensity },
    { icon: Ruler, label: "Application", value: product.recommendedApplication },
  ];



  return (
    <main>
      <Navbar />

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-primary transition-colors">Catalog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-on-surface font-medium">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Image Gallery */}
            <div>
              <div
                className="relative aspect-square rounded-3xl overflow-hidden bg-surface-container-highest/40 cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300"
                onClick={() => setLightboxOpen(true)}
              >
                <Image
                  src={galleryImages[activeImageIndex] || product.image}
                  alt={`${product.name} primary angle`}
                  fill
                  className="object-cover transition-transform duration-150 ease-out"
                  priority
                  unoptimized={(galleryImages[activeImageIndex] || product.image).startsWith("http") || (galleryImages[activeImageIndex] || product.image).includes("supabase")}
                />
                
                {/* Visual Expand View Button */}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm shadow-md flex items-center gap-2 transform transition-all duration-300 group-hover:bg-primary group-hover:scale-105 group-hover:shadow-primary/20 pointer-events-none">
                  <Maximize2 className="w-3.5 h-3.5" />
                  Click to Expand
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex flex-wrap gap-3 mt-4">
                {galleryImages.map((img, i) => {
                  const isActive = activeImageIndex === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden bg-surface-container-highest/40 border-2 transition-all ${
                        isActive
                          ? "border-primary ring-2 ring-primary/40 shadow-md scale-95"
                          : "border-outline-variant/35 hover:border-primary/50"
                      }`}
                      type="button"
                    >
                      <Image
                        src={img}
                        alt={`${product.name} view ${i + 1}`}
                        fill
                        className="object-cover"
                        unoptimized={img.startsWith("http") || img.includes("supabase")}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <span className="text-xs font-medium text-primary uppercase tracking-widest">
                {product.category.replace("-", " ")}
              </span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-on-surface mt-2 tracking-tight">
                {product.name}
              </h1>
              <p className="text-on-surface-variant mt-3 leading-relaxed">
                {product.longDescription}
              </p>

              {/* Material Selection */}
              <div className="mt-8">
                <h3 className="font-heading text-sm font-semibold text-on-surface mb-3 flex items-center gap-2">
                  <span>Select Material</span>
                  <span className="text-xs text-on-surface-variant font-normal">(FDM / SLA Technologies)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.materials.map((material) => {
                    const info = getMaterialInfo(material);
                    const isSelected = activeMaterial === material;
                    return (
                      <button
                        key={material}
                        type="button"
                        onClick={() => setSelectedMaterial(material)}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                          isSelected
                            ? "bg-surface-container-high border-primary shadow-lg shadow-primary/5"
                            : "bg-surface-container-low/40 border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container-low/80"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${info.colorClass} shrink-0 mt-1 shadow-sm`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="font-semibold text-sm text-on-surface truncate">{material}</span>
                            {info.multiplier > 1 && (
                              <span className="text-[10px] font-bold text-primary shrink-0 bg-primary/10 px-1.5 py-0.5 rounded-md">
                                +{Math.round((info.multiplier - 1) * 100)}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2 leading-relaxed">
                            {info.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Finish Selection */}
              <div className="mt-6">
                <h3 className="font-heading text-sm font-semibold text-on-surface mb-3 flex items-center gap-2">
                  <span>Select Finish</span>
                  <span className="text-xs text-on-surface-variant font-normal">(Post-Processing Treatment)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.finishes.map((finish) => {
                    const info = getFinishInfo(finish);
                    const isSelected = activeFinish === finish;
                    return (
                      <button
                        key={finish}
                        type="button"
                        onClick={() => setSelectedFinish(finish)}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                          isSelected
                            ? "bg-surface-container-high border-primary shadow-lg shadow-primary/5"
                            : "bg-surface-container-low/40 border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container-low/80"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${info.colorClass} shrink-0 mt-1 shadow-sm border border-white/10`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="font-semibold text-sm text-on-surface truncate">{finish}</span>
                            {info.surcharge > 0 && (
                              <span className="text-[10px] font-bold text-primary shrink-0 bg-primary/10 px-1.5 py-0.5 rounded-md">
                                +₹{info.surcharge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2 leading-relaxed">
                            {info.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Price & Production Lead Time */}
              <div className="mt-8 p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <span className="font-heading text-3xl font-bold text-on-surface block">
                    ₹{dynamicPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-emerald-600 font-medium mt-0.5 block">
                    Est. Delivery: {getDeliveryEstimate(product.productionDays)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-on-surface-variant block">
                    Production Lead Time
                  </span>
                  <span className="text-sm font-semibold text-on-surface block">
                    {product.productionDays} Days
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-full gradient-primary text-white font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
                  id="add-to-cart"
                >
                  {isAuthenticated ? (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Login to Add to Cart
                    </>
                  )}
                </button>
              </div>

              {/* Mechanical Performance Diagnostics */}
              <div className="mt-8 p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                <h3 className="font-heading text-sm font-semibold text-on-surface flex items-center gap-2 mb-5">
                  <Cpu className="w-4 h-4 text-primary" />
                  Material Performance Diagnostics
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-on-surface-variant">Detail Fidelity</span>
                      <span className="text-primary font-bold">{materialInfo.detail}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden relative">
                      <div
                        className="h-full gradient-primary rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(109,92,255,0.4)]"
                        style={{ width: `${materialInfo.detail}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-on-surface-variant">Tensile / Impact Strength</span>
                      <span className="text-primary font-bold">{materialInfo.strength}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                        style={{ width: `${materialInfo.strength}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-on-surface-variant">Strength-to-Weight Efficiency</span>
                      <span className="text-primary font-bold">{materialInfo.weight}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(14,165,233,0.4)]"
                        style={{ width: `${materialInfo.weight}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Specs */}
              <div className="mt-6 p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                <h3 className="font-heading text-sm font-semibold text-on-surface flex items-center gap-2 mb-4">
                  <Ruler className="w-4 h-4 text-primary" />
                  Dimensional Specifications
                </h3>
                <div className="space-y-4">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex justify-between items-center">
                      <span className="text-sm text-on-surface-variant flex items-center gap-2">
                        <spec.icon className="w-3.5 h-3.5 text-on-surface-variant/70" />
                        {spec.label}
                      </span>
                      <span className="text-sm font-medium text-on-surface">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Curated Sets / Related */}
          <section className="mt-24">
            <h2 className="font-heading text-3xl font-bold text-on-surface tracking-tight mb-10">
              Curated Sets
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {recommended.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        </div>
      </div>

      <Footer />

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-6 animate-scale-in select-none">
          {/* Header */}
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg md:text-xl font-bold text-white tracking-tight">
                {product.name}
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Angle {activeImageIndex + 1} of {galleryImages.length}
              </p>
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-3 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Close Expand View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Visual Slider Area */}
          <div className="flex-1 flex items-center justify-between relative max-w-5xl mx-auto w-full my-6">
            {/* Prev Trigger */}
            <button
              onClick={() => setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
              className="p-3.5 rounded-full bg-white/5 text-white/70 hover:bg-white/15 hover:text-white transition-all scale-100 hover:scale-105 active:scale-95 z-10 cursor-pointer border border-white/10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Expander Image Container */}
            <div className="relative flex-1 h-[55vh] md:h-[65vh] mx-4 overflow-hidden rounded-2xl">
              <Image
                src={galleryImages[activeImageIndex] || product.image}
                alt={`${product.name} detail view ${activeImageIndex + 1}`}
                fill
                className="object-contain animate-scale-in"
                unoptimized={(galleryImages[activeImageIndex] || product.image).startsWith("http") || (galleryImages[activeImageIndex] || product.image).includes("supabase")}
              />
            </div>

            {/* Next Trigger */}
            <button
              onClick={() => setActiveImageIndex((prev) => (prev + 1) % galleryImages.length)}
              className="p-3.5 rounded-full bg-white/5 text-white/70 hover:bg-white/15 hover:text-white transition-all scale-100 hover:scale-105 active:scale-95 z-10 cursor-pointer border border-white/10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Thumbnails Footer Panel */}
          <div className="max-w-xl mx-auto w-full pb-4">
            <div className="flex justify-center gap-3">
              {galleryImages.map((img, i) => {
                const isActive = activeImageIndex === i;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden bg-white/5 border-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-white ring-4 ring-white/10 scale-95 shadow-md"
                        : "border-transparent hover:border-white/20"
                    }`}
                    type="button"
                  >
                    <Image
                      src={img}
                      alt={`Angle ${i + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={img.startsWith("http") || img.includes("supabase")}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
