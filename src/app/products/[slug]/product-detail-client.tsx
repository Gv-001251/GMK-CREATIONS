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
import { ChevronRight, Minus, Plus, ShoppingCart, Maximize2, LogIn, ChevronLeft, X, Star, CheckCircle2, MessageSquare, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { getDeliveryEstimate } from "@/lib/utils/date-estimator";
import { toast } from "@/components/toast";

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
  "PLA (Polylactic Acid)": { multiplier: 1.0, description: "Easy printing, biodegradable thermoplastic (₹5/g)", colorClass: "bg-emerald-500", detail: 75, strength: 55, weight: 60 },
  "TBU (Thermoplastic Polyurethane)": { multiplier: 1.6, description: "Flexible, shock-absorbing and durable (₹8/g)", colorClass: "bg-sky-500", detail: 80, strength: 85, weight: 75 }
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

const COLOR_PALETTE = [
  { name: "Pure White", code: "#FFFFFF", colorClass: "bg-[#FFFFFF] border-zinc-200" },
  { name: "Matte Black", code: "#111111", colorClass: "bg-[#111111] border-zinc-800" },
  { name: "Slate Grey", code: "#6B7280", colorClass: "bg-[#6B7280] border-gray-400" },
  { name: "Crimson Red", code: "#DC2626", colorClass: "bg-[#DC2626] border-red-500" },
  { name: "Royal Blue", code: "#1D4ED8", colorClass: "bg-[#1D4ED8] border-blue-600" },
  { name: "Emerald Green", code: "#047857", colorClass: "bg-[#047857] border-emerald-600" },
  { name: "Cyber Orange", code: "#EA580C", colorClass: "bg-[#EA580C] border-orange-500" },
  { name: "Lemon Yellow", code: "#CA8A04", colorClass: "bg-[#CA8A04] border-yellow-500" },
  { name: "Deep Purple", code: "#6D28D9", colorClass: "bg-[#6D28D9] border-purple-600" },
  { name: "Sakura Pink", code: "#DB2777", colorClass: "bg-[#DB2777] border-pink-500" },
  { name: "Gold Metallic", code: "#D97706", colorClass: "bg-[#D97706] border-amber-500" },
  { name: "Silver Metallic", code: "#94A3B8", colorClass: "bg-[#94A3B8] border-slate-300" },
  { name: "Bronze Metallic", code: "#78350F", colorClass: "bg-[#78350F] border-amber-900" },
  { name: "Copper Metallic", code: "#B45309", colorClass: "bg-[#B45309] border-amber-700" },
  { name: "Mint Green", code: "#34D399", colorClass: "bg-[#34D399] border-emerald-300" },
  { name: "Sky Blue", code: "#38BDF8", colorClass: "bg-[#38BDF8] border-sky-300" }
];

interface Review {
  id: number;
  author_name: string;
  rating: number;
  comment: string;
  verified: boolean;
  created_at: string;
}

const MOCK_FAQS = [
  {
    question: "What is the difference between PLA and TBU?",
    answer: "PLA (Polylactic Acid) is a rigid, biodegradable plastic that is ideal for detailed decorative items, models, and low-stress parts. TBU (Thermoplastic Polyurethane) is a flexible, rubber-like material with high shock-absorption, wear resistance, and elasticity—perfect for protective cases, functional parts, and flexible gears."
  },
  {
    question: "How long does it take to print and ship my order?",
    answer: "Production lead times are calculated dynamically per product based on volume and complexity (usually 1-3 days for PLA, and slightly longer for TBU). Delivery typically takes 2-4 days post-production depending on your location."
  },
  {
    question: "How do I care for and clean my 3D printed items?",
    answer: "To clean, simply wipe with a warm damp cloth. Avoid exposing PLA prints to high temperatures (above 55°C / 130°F), direct hot sunlight, or harsh chemical solvents, as they may deform. TBU is highly chemical and heat resistant, but mild soapy water is always recommended."
  },
  {
    question: "Can I request custom sizing or a completely custom design?",
    answer: "Yes! You can use our 'Upload Model' page to upload any custom STL/OBJ 3D file, configure dimensions, infill, and material, and get an instant quote. For fully custom design services, you can contact our support team."
  }
];

export default function ProductDetailClient() {
  const params = useParams();
  const { fetchProducts, getProductBySlug, getRecommendedProducts, isLoading } = useProductsStore();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
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

  const [selectedMaterial, setSelectedMaterial] = useState("PLA (Polylactic Acid)");
  const [selectedPrimaryColor, setSelectedPrimaryColor] = useState("");
  const [selectedSecondaryColor, setSelectedSecondaryColor] = useState("");

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const productId = product?.id;

  // Load genuine, database-backed reviews for this product
  useEffect(() => {
    if (!productId) return;
    let active = true;
    setReviewsLoading(true);
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (active) setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      })
      .catch(() => {
        if (active) setReviews([]);
      })
      .finally(() => {
        if (active) setReviewsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId]);

  const refreshReviews = async () => {
    if (!productId) return;
    try {
      const data = await fetch(
        `/api/reviews?productId=${encodeURIComponent(productId)}`
      ).then((r) => r.json());
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch {
      /* keep existing list on refresh failure */
    }
  };

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${product?.slug ?? ""}`);
      return;
    }
    setShowReviewForm((prev) => !prev);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${product?.slug ?? ""}`);
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please write a short comment.");
      return;
    }
    if (!productId) return;

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to submit review.");

      await refreshReviews();
      setReviewComment("");
      setReviewRating(5);
      setShowReviewForm(false);
      toast.success("Thanks! Your review has been posted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedPrimaryColor("");
    setSelectedSecondaryColor("");
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

  const activeMaterial = selectedMaterial || "PLA (Polylactic Acid)";
  const activeFinish = "Standard";

  const materialInfo = getMaterialInfo(activeMaterial);
  const finishInfo = getFinishInfo(activeFinish);
  const dynamicPrice = (product.price * materialInfo.multiplier) + finishInfo.surcharge;

  const isDualColor = product ? (product.isDualColor || 
    product.name.toLowerCase().includes("keychain") || 
    product.name.toLowerCase().includes("nameplate") ||
    product.name.toLowerCase().includes("desk")) : false;

  const defaultPrimaryColor = COLOR_PALETTE[0].name;
  const defaultSecondaryColor = COLOR_PALETTE[1]?.name || COLOR_PALETTE[0].name;

  const activePrimaryColor = selectedPrimaryColor || defaultPrimaryColor;
  const activeSecondaryColor = selectedSecondaryColor || defaultSecondaryColor;

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
      primaryColor: activePrimaryColor,
      secondaryColor: isDualColor ? activeSecondaryColor : undefined,
      quantity: 1,
    });
  };



  // Review statistics computed from the real, persisted reviews
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;
  const roundedAverage = Math.round(averageRating);
  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    return {
      stars,
      count,
      pct: reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0,
    };
  });
  const formatReviewDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });



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
                  sizes="(max-width: 1024px) 100vw, 640px"
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
                        sizes="80px"
                        className="object-cover"
                        unoptimized={img.startsWith("http") || img.includes("supabase")}
                      />
                    </button>
                  );
                })}
              </div>



              {/* Divider */}
              <div className="border-t border-outline-variant/10 my-8" />

              {/* Reviews Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-bold text-on-surface flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Customer Reviews
                  </h2>
                  <button
                    onClick={handleWriteReviewClick}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    Write a Review
                  </button>
                </div>

                {reviewsLoading ? (
                  <div className="p-6 rounded-2xl bg-surface-container-low/40 border border-outline-variant/10 text-center text-sm text-on-surface-variant animate-pulse">
                    Loading reviews…
                  </div>
                ) : reviewCount === 0 ? (
                  /* Empty state — no genuine reviews yet */
                  <div className="p-8 rounded-2xl bg-surface-container-low/40 border border-outline-variant/10 text-center">
                    <MessageSquare className="w-7 h-7 text-on-surface-variant/40 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-on-surface">No reviews yet</p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Be the first to share your experience with this product.
                    </p>
                    <button
                      onClick={handleWriteReviewClick}
                      className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-full gradient-primary text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      Write a Review
                    </button>
                  </div>
                ) : (
                  /* Reviews Summary Card — computed from real reviews */
                  <div className="p-5 rounded-2xl bg-surface-container-low/40 border border-outline-variant/10 flex flex-col sm:flex-row gap-6 items-center">
                    <div className="text-center sm:border-r border-outline-variant/20 sm:pr-8">
                      <span className="text-4xl font-extrabold text-on-surface">
                        {averageRating.toFixed(1)}
                      </span>
                      <div className="flex items-center justify-center gap-0.5 mt-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= roundedAverage
                                ? "fill-amber-400 text-amber-400"
                                : "fill-on-surface-variant/20 text-on-surface-variant/20"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-on-surface-variant mt-1.5 block">
                        Based on {reviewCount} review{reviewCount === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      {/* Star Breakdown */}
                      {ratingBreakdown.map((row) => (
                        <div key={row.stars} className="flex items-center gap-3 text-xs">
                          <span className="w-3 text-on-surface-variant font-medium text-right">{row.stars}</span>
                          <Star className="w-3.5 h-3.5 fill-on-surface-variant/40 text-on-surface-variant/40 shrink-0" />
                          <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${row.pct}%` }} />
                          </div>
                          <span className="w-8 text-on-surface-variant text-right">{row.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Write Review Form */}
                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} className="p-5 rounded-2xl bg-surface-container-low border border-primary/20 space-y-4 animate-scale-in">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-heading text-sm font-bold text-on-surface">Write your review</h3>
                      {user?.name && (
                        <span className="text-[11px] text-on-surface-variant">
                          Posting as <span className="font-semibold text-on-surface">{user.name}</span>
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant block mb-1">Rating</label>
                      <div className="flex items-center gap-1.5 h-10">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="focus:outline-none"
                            aria-label={`${star} star${star === 1 ? "" : "s"}`}
                          >
                            <Star className={`w-6 h-6 ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-outline-variant/60"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant block mb-1">Review Details</label>
                      <textarea
                        required
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full text-sm px-3.5 py-2 rounded-xl bg-surface-container border border-outline-variant/30 focus:border-primary focus:outline-none text-on-surface resize-none"
                        placeholder="What did you think of this product?"
                      />
                    </div>
                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-4 py-2 rounded-full font-semibold border border-outline-variant/40 hover:bg-surface-container-high text-on-surface transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-5 py-2 rounded-full gradient-primary text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {submittingReview ? "Posting…" : "Submit"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Review List */}
                {reviewCount > 0 && (
                  <div className="space-y-4">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-5 rounded-2xl bg-surface-container-low/40 border border-outline-variant/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-sm text-on-surface block">{rev.author_name}</span>
                            <span className="text-[10px] text-on-surface-variant">{formatReviewDate(rev.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-3 h-3 ${star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-outline-variant/30"}`} />
                              ))}
                            </div>
                            {rev.verified && (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Verified Purchase
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
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
                  {Object.keys(MATERIAL_METADATA).map((material) => {
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

              {/* Color Selection */}
              <div className="mt-6 border-t border-outline-variant/10 pt-6 space-y-6">
                {isDualColor ? (
                  <div className="space-y-6">
                    {/* Primary Color */}
                    <div>
                      <div className="flex justify-between items-baseline mb-3">
                        <span className="font-heading text-xs font-bold tracking-widest text-on-surface uppercase">
                          Color Palette 1 (Base)
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">
                          {activePrimaryColor} <span className="text-xs text-on-surface-variant/60 font-mono">({COLOR_PALETTE.find(c => c.name === activePrimaryColor)?.code || ""})</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {COLOR_PALETTE.map((color) => {
                          const isSelected = activePrimaryColor === color.name;
                          return (
                            <button
                              key={`primary-${color.name}`}
                              type="button"
                              onClick={() => setSelectedPrimaryColor(color.name)}
                              className={`w-10 h-10 rounded-full ${color.colorClass} relative transition-all duration-200 border shadow-sm ${
                                isSelected
                                  ? "ring-2 ring-zinc-800 ring-offset-2 ring-offset-background scale-110 shadow-md"
                                  : "hover:scale-105 opacity-85 hover:opacity-100"
                              }`}
                              title={`${color.name} (${color.code})`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Secondary Color */}
                    <div>
                      <div className="flex justify-between items-baseline mb-3">
                        <span className="font-heading text-xs font-bold tracking-widest text-on-surface uppercase">
                          Color Palette 2 (Text / Accent)
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">
                          {activeSecondaryColor} <span className="text-xs text-on-surface-variant/60 font-mono">({COLOR_PALETTE.find(c => c.name === activeSecondaryColor)?.code || ""})</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {COLOR_PALETTE.map((color) => {
                          const isSelected = activeSecondaryColor === color.name;
                          return (
                            <button
                              key={`secondary-${color.name}`}
                              type="button"
                              onClick={() => setSelectedSecondaryColor(color.name)}
                              className={`w-10 h-10 rounded-full ${color.colorClass} relative transition-all duration-200 border shadow-sm ${
                                isSelected
                                  ? "ring-2 ring-zinc-800 ring-offset-2 ring-offset-background scale-110 shadow-md"
                                  : "hover:scale-105 opacity-85 hover:opacity-100"
                              }`}
                              title={`${color.name} (${color.code})`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-baseline mb-3">
                      <span className="font-heading text-xs font-bold tracking-widest text-on-surface uppercase">
                        Color Palette (Single Color)
                      </span>
                      <span className="text-xs text-on-surface-variant font-medium">
                        {activePrimaryColor} <span className="text-xs text-on-surface-variant/60 font-mono">({COLOR_PALETTE.find(c => c.name === activePrimaryColor)?.code || ""})</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {COLOR_PALETTE.map((color) => {
                        const isSelected = activePrimaryColor === color.name;
                        return (
                          <button
                            key={`single-${color.name}`}
                            type="button"
                            onClick={() => setSelectedPrimaryColor(color.name)}
                            className={`w-10 h-10 rounded-full ${color.colorClass} relative transition-all duration-200 border shadow-sm ${
                              isSelected
                                ? "ring-2 ring-zinc-800 ring-offset-2 ring-offset-background scale-110 shadow-md"
                                : "hover:scale-105 opacity-85 hover:opacity-100"
                            }`}
                            title={`${color.name} (${color.code})`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
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





              {/* FAQs Section */}
              <div className="mt-6 p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10 space-y-4">
                <h3 className="font-heading text-sm font-semibold text-on-surface flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  Frequently Asked Questions
                </h3>

                <div className="space-y-3">
                  {MOCK_FAQS.map((faq, idx) => {
                    const isOpen = faqOpenIndex === idx;
                    return (
                      <div key={idx} className="border border-outline-variant/15 rounded-2xl overflow-hidden transition-colors">
                        <button
                          type="button"
                          onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between p-3.5 bg-surface-container-low/50 hover:bg-surface-container-low text-left font-semibold text-xs text-on-surface transition-colors focus:outline-none focus:ring-0"
                        >
                          <span>{faq.question}</span>
                          {isOpen ? (
                            <ChevronUp className="w-3.5 h-3.5 text-on-surface-variant" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="p-3.5 bg-surface-container-low/20 border-t border-outline-variant/10 animate-fade-in">
                            <p className="text-[11px] text-on-surface-variant leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Informative Shipping & Quality Guarantee Card */}
              <div className="mt-6 p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10 space-y-4">
                <h3 className="font-heading text-sm font-semibold text-on-surface flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Quality & Service Guarantee
                </h3>
                <div className="text-xs text-on-surface-variant space-y-3 leading-relaxed">
                  <p>
                    <strong className="text-on-surface block mb-0.5">Precision Calibrated Prints</strong>
                    All items are printed on industrial-grade 3D printers using premium filaments, ensuring accurate sizing and clean layer lines.
                  </p>
                  <p>
                    <strong className="text-on-surface block mb-0.5">Eco-Friendly Materials</strong>
                    Our PLA is 100% biodegradable and organic. TBU prints are highly durable, food-safe, and recyclable.
                  </p>
                  <p>
                    <strong className="text-on-surface block mb-0.5">Secure Shockproof Shipping</strong>
                    We pack all items carefully with multiple layers of bubble wrap and sturdy box packaging to prevent transit damage.
                  </p>
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
                sizes="(max-width: 1024px) 100vw, 1024px"
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
                      sizes="56px"
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
