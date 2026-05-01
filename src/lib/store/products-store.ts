import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products as staticProducts, type Product } from "@/lib/data/products";

interface ProductsState {
  products: Product[];
  updatePrice: (productId: string, newPrice: number) => void;
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  getFeaturedProducts: () => Product[];
  getRecommendedProducts: (excludeId?: string) => Product[];
  resetToDefaults: () => void;
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: staticProducts,

      updatePrice: (productId, newPrice) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, price: newPrice } : p
          ),
        }));
      },

      addProduct: (product) => {
        set((state) => ({
          products: [product, ...state.products],
        }));
      },

      removeProduct: (productId) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        }));
      },

      getProductBySlug: (slug) => {
        return get().products.find((p) => p.slug === slug);
      },

      getProductsByCategory: (category) => {
        if (category === "all") return get().products;
        return get().products.filter((p) => p.category === category);
      },

      getFeaturedProducts: () => {
        return get().products.filter((p) => p.featured);
      },

      getRecommendedProducts: (excludeId) => {
        return get().products
          .filter((p) => p.id !== excludeId)
          .slice(0, 4);
      },

      resetToDefaults: () => {
        set({ products: staticProducts });
      },
    }),
    {
      name: "gmk-products",
    }
  )
);
