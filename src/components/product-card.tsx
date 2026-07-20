"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/lib/data/products";
import { isNewProduct } from "@/lib/utils/product-status";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact";
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const isCompact = variant === "compact";

  // A product shows the "New" badge only for a limited window after it was
  // added (based on created_at). Bundled fallback products without a created_at
  // fall back to their manual isNew flag.
  const showNew = product.createdAt
    ? isNewProduct(product.createdAt)
    : !!product.isNew;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block transition-all duration-300 hover:-translate-y-1.5 h-full"
      id={`product-card-${product.id}`}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] sm:rounded-[40px] border border-slate-200/50 dark:border-zinc-800/50 p-2 sm:p-[11px] flex flex-col h-full w-full shadow-sm hover:shadow-xl transition-all duration-300">
        {/* Product Image */}
        <div className="relative aspect-[73/78] overflow-hidden bg-slate-50 dark:bg-zinc-800 rounded-[24px] sm:rounded-[32px] w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized={product.image.startsWith("http")}
          />

          {/* Badges */}
          {(product.badge || showNew) && (
            <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 flex flex-wrap gap-1.5 z-10">
              {showNew && (
                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-white text-[9px] sm:text-[10px] font-mono font-bold text-emerald-600 shadow-sm uppercase tracking-wider backdrop-blur-sm">
                  New
                </span>
              )}
              {product.badge && (
                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-white text-[9px] sm:text-[10px] font-mono font-bold text-slate-900 shadow-sm uppercase tracking-wider backdrop-blur-sm">
                  {product.badge}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        {!isCompact && (
          <div className="flex flex-col flex-1 pl-[4%] pr-[4%] pb-[3%] sm:pl-[7.61%] sm:pr-[6.88%] sm:pb-[5.16%] mt-4 sm:mt-[21.82px]">
            <h3 className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-primary transition-colors truncate">
              {product.name}
            </h3>
            <p className="font-mono text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-2 mb-4 sm:mb-6 leading-relaxed line-clamp-2 flex-1">
              {product.description}
            </p>
            <div className="flex items-end justify-between mt-auto gap-2">
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-mono text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block truncate">
                  {product.name}
                </span>
                {product.priceLabel ? (
                  <div className="flex flex-col leading-none">
                    <span className="font-mono text-[10px] sm:text-xs font-medium text-slate-400 dark:text-slate-500 line-through">
                      {product.priceLabel}
                    </span>
                    <span className="font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                      ₹{product.price.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-none">
                    ₹{product.price.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="text-slate-900 dark:text-white transition-transform duration-300 group-hover:translate-x-1 mb-0.5 flex-shrink-0">
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5px]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
