"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ProductGrid } from "@/components/product-grid";
import { Footer } from "@/components/footer";
import { useProductsStore } from "@/lib/store/products-store";
import { useRealtimeProducts } from "@/lib/hooks/use-realtime-admin";
import { categories } from "@/lib/data/categories";
import { SlidersHorizontal, X } from "lucide-react";

const filterTabs = [
  { id: "all", label: "All Materials" },
  { id: "industrial", label: "Industrial" },
  { id: "organic", label: "Organic" },
];

function ProductsContent() {
  const { products, fetchProducts } = useProductsStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");

  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const productsPerPage = 10;

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, [fetchProducts]);

  // Re-fetch products automatically when an admin updates the catalog
  useRealtimeProducts(fetchProducts);

  const activeProducts = mounted ? products : [];

  // Find active category if category parameter is present
  const activeCategory = useMemo(() => {
    if (!categoryParam) return null;
    return categories.find((c) => c.slug === categoryParam);
  }, [categoryParam]);

  // Determine active tab highlighting based on query parameter or state
  const activeFilterTab = useMemo(() => {
    if (!categoryParam) return activeFilter;
    if (["custom-parts", "edc-gear", "prototypes"].includes(categoryParam)) {
      return "industrial";
    }
    if (["decor", "miniatures", "jewelry"].includes(categoryParam)) {
      return "organic";
    }
    return "all";
  }, [categoryParam, activeFilter]);

  const filteredProducts = useMemo(() => {
    let list = activeProducts;

    // Filter by category query param if present
    if (categoryParam) {
      list = list.filter((p) => p.category === categoryParam);
    } else {
      // Otherwise apply material group tab filter
      if (activeFilter === "industrial") {
        list = list.filter((p) =>
          ["custom-parts", "edc-gear", "prototypes"].includes(p.category)
        );
      } else if (activeFilter === "organic") {
        list = list.filter((p) =>
          ["decor", "miniatures", "jewelry"].includes(p.category)
        );
      }
    }
    return list;
  }, [categoryParam, activeFilter, activeProducts]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleTabClick = (tabId: string) => {
    setActiveFilter(tabId);
    setCurrentPage(1);
    // Clear URL category search parameter when selecting a main material filter
    if (categoryParam) {
      router.push("/products");
    }
  };

  const handleClearCategory = () => {
    router.push("/products");
    setActiveFilter("all");
    setCurrentPage(1);
  };

  return (
    <main>
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
                Catalog
              </h1>
              <p className="text-on-surface-variant mt-3 max-w-lg leading-relaxed">
                Precision engineered components and curated organic forms, ready for deployment.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                    activeFilterTab === tab.id
                      ? "bg-on-surface text-background font-semibold"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <button className="p-2.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors">
                <SlidersHorizontal className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>
          </div>

          {/* Active Category Badge */}
          {activeCategory && (
            <div className="flex items-center gap-2 mb-8 animate-fade-in">
              <span className="text-sm text-on-surface-variant">Category:</span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/[0.08] text-primary text-xs font-semibold border border-primary/10 shadow-sm">
                {activeCategory.name}
                <button
                  onClick={handleClearCategory}
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                  aria-label="Clear category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <ProductGrid products={paginatedProducts} columns={5} />
          ) : (
            <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-outline-variant/30">
              <p className="text-on-surface-variant font-medium">No products found in this category.</p>
              <button
                onClick={handleClearCategory}
                className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full gradient-primary text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
              >
                View All Products
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-16">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-full text-sm text-on-surface-variant hover:text-on-surface disabled:opacity-30 transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                    currentPage === i + 1
                      ? "gradient-primary text-white"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-full text-sm text-on-surface-variant hover:text-on-surface disabled:opacity-30 transition-colors"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main>
          <Navbar />
          <div className="pt-40 pb-40 text-center text-on-surface-variant">
            <div className="inline-block animate-pulse text-sm font-medium">
              Loading catalog...
            </div>
          </div>
          <Footer />
        </main>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
