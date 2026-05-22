"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ProductGrid } from "@/components/product-grid";
import { Footer } from "@/components/footer";
import { useProductsStore } from "@/lib/store/products-store";
import { SlidersHorizontal } from "lucide-react";

const filterTabs = [
  { id: "all", label: "All Materials" },
  { id: "industrial", label: "Industrial" },
  { id: "organic", label: "Organic" },
];

export default function ProductsPage() {
  const { products, fetchProducts } = useProductsStore();
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const productsPerPage = 10;

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, [fetchProducts]);

  const activeProducts = mounted ? products : [];

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") return activeProducts;
    if (activeFilter === "industrial") {
      return activeProducts.filter((p) =>
        ["custom-parts", "edc-gear", "prototypes"].includes(p.category)
      );
    }
    if (activeFilter === "organic") {
      return activeProducts.filter((p) =>
        ["decor", "miniatures", "jewelry"].includes(p.category)
      );
    }
    return activeProducts;
  }, [activeFilter, activeProducts]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

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
                  onClick={() => {
                    setActiveFilter(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeFilter === tab.id
                      ? "bg-on-surface text-background"
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

          {/* Product Grid */}
          <ProductGrid products={paginatedProducts} columns={5} />

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
