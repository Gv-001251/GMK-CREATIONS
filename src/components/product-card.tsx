"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import type { Product } from "@/lib/data/products";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact";
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      material: product.materials[0],
      finish: product.finishes[0],
    });
  };

  const isCompact = variant === "compact";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      id={`product-card-${product.id}`}
    >
      <div className="relative overflow-hidden rounded-3xl bg-surface-container-highest/40 aspect-square mb-4 transition-all duration-500 group-hover:shadow-ambient-lg">
        {/* Product Image */}
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-700 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
          unoptimized={product.image.startsWith("http")}
        />

        {/* Badges */}
        {(product.badge || product.isNew) && (
          <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
            {product.isNew && (
              <Badge className="bg-emerald-500/90 text-white text-[10px] font-semibold px-3 py-1 rounded-full border-0 backdrop-blur-sm">
                New
              </Badge>
            )}
            {product.badge && (
              <Badge className="bg-primary/90 text-white text-[10px] font-semibold px-3 py-1 rounded-full border-0 backdrop-blur-sm">
                {product.badge}
              </Badge>
            )}
          </div>
        )}

        {/* Quick Add */}
        {!isCompact && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-4 right-4 p-3 rounded-full gradient-primary text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:shadow-primary/30"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Info */}
      {!isCompact && (
        <div className="px-1">
          <h3 className="font-heading text-base font-semibold text-on-surface tracking-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-on-surface-variant mt-0.5 line-clamp-1">
            {product.description}
          </p>
          <p className="text-sm font-semibold text-primary mt-2">
            {product.priceLabel || `₹${product.price.toFixed(2)}`}
          </p>
        </div>
      )}
    </Link>
  );
}
