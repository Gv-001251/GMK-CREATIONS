"use client";

import Link from "next/link";
import { categories } from "@/lib/data/categories";

export function CategoryCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all duration-300 hover:shadow-ambient"
            id={`category-${category.slug}`}
          >
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Icon className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
            </div>
            <span className="text-sm font-medium text-on-surface text-center">
              {category.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
