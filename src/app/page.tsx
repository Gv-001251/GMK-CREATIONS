"use client";

import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { ProductCard } from "@/components/product-card";
import { CategoryCards } from "@/components/category-cards";
import { Footer } from "@/components/footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { useProductsStore } from "@/lib/store/products-store";

export default function HomePage() {
  const { fetchProducts, getFeaturedProducts, getRecommendedProducts } = useProductsStore();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, [fetchProducts]);

  const featured = mounted ? getFeaturedProducts() : [];
  const recommended = mounted ? getRecommendedProducts() : [];

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      router.replace("/admin");
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated && user?.role === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main>
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-medium text-primary uppercase tracking-widest">
                Flagship
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-on-surface mt-2 tracking-tight">
                Our flagship precision prints.
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-20 px-4 sm:px-6 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-on-surface mb-10 tracking-tight">
            Browse by Category
          </h2>
          <CategoryCards />
        </div>
      </section>

      {/* Recommendations */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
              You might also like
            </h2>
            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              See more
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {recommended.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Custom Upload CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-10 md:p-16">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }} />

            <div className="relative z-10 max-w-xl">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                Have a custom file?
              </h2>
              <p className="text-white/80 leading-relaxed mb-8">
                Upload your .STL or .OBJ models directly. We provide instant material analysis and precision slicing.
              </p>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-primary font-semibold text-sm hover:bg-white/90 transition-all shadow-lg"
                id="upload-cta"
              >
                Upload Your Model
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
