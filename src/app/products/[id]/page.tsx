"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ProductCard } from "@/components/product-card";
import { Footer } from "@/components/footer";
import { getProductBySlug, getRecommendedProducts } from "@/lib/data/products";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { ChevronRight, Minus, Plus, ShoppingCart, Cpu, Ruler, Layers, Maximize2, LogIn } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const product = getProductBySlug(params.id as string);
  const recommended = getRecommendedProducts(product?.id);
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [selectedMaterial, setSelectedMaterial] = useState(product?.materials[0] || "");
  const [selectedFinish, setSelectedFinish] = useState(product?.finishes[0] || "");
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <main>
        <Navbar />
        <div className="pt-32 pb-20 px-6 text-center">
          <h1 className="font-heading text-3xl font-bold">Product Not Found</h1>
          <Link href="/products" className="text-primary mt-4 inline-block">
            Back to Catalog
          </Link>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      material: selectedMaterial,
      finish: selectedFinish,
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
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-surface-container-highest/40">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Thumbnails */}
              <div className="flex gap-3 mt-4">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-container-highest/40 border-2 border-primary/20 cursor-pointer"
                  >
                    <Image src={img} alt={`${product.name} view ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
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
                <h3 className="font-heading text-sm font-semibold text-on-surface mb-3">
                  Select Material
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material) => (
                    <button
                      key={material}
                      onClick={() => setSelectedMaterial(material)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                        selectedMaterial === material
                          ? "bg-on-surface text-background"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              </div>

              {/* Finish Selection */}
              <div className="mt-6">
                <h3 className="font-heading text-sm font-semibold text-on-surface mb-3">
                  Select Finish
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.finishes.map((finish) => (
                    <button
                      key={finish}
                      onClick={() => setSelectedFinish(finish)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                        selectedFinish === finish
                          ? "bg-on-surface text-background"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      {finish}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div className="mt-8 flex items-center gap-6">
                <span className="font-heading text-3xl font-bold text-on-surface">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm text-on-surface-variant">
                  Est. Production: {product.productionDays} Days
                </span>
              </div>

              <div className="mt-6 flex items-center gap-4">
                {/* Quantity */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-surface-container">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 hover:bg-surface-container-high rounded-full transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 hover:bg-surface-container-high rounded-full transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full gradient-primary text-white font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
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

              {/* Technical Specs */}
              <div className="mt-10 p-6 rounded-2xl bg-surface-container-low">
                <h3 className="font-heading text-sm font-semibold text-on-surface flex items-center gap-2 mb-4">
                  <Cpu className="w-4 h-4 text-primary" />
                  Technical Specs
                </h3>
                <div className="space-y-4">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex justify-between items-center">
                      <span className="text-sm text-on-surface-variant">{spec.label}</span>
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
    </main>
  );
}
