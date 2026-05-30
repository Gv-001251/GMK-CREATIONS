import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Product } from "@/lib/data/products";

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  fetchProducts: (limit?: number, offset?: number) => Promise<void>;
  updatePrice: (productId: string, newPrice: number) => void;
  addProduct: (product: Product) => Promise<void>;
  removeProduct: (productId: string) => void;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  getFeaturedProducts: () => Product[];
  getRecommendedProducts: (excludeId?: string) => Product[];
  resetToDefaults: () => void;
}

// Convert snake_case DB row to camelCase Product interface
function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) || "",
    longDescription: (row.long_description as string) || "",
    price: Number(row.price) || 0,
    priceLabel: (row.price_label as string) || undefined,
    category: (row.category as string) || "general",
    image: (row.image as string) || "",
    images: (row.images as string[]) || [],
    badge: (row.badge as string) || undefined,
    materials: (row.materials as string[]) || [],
    finishes: (row.finishes as string[]) || [],
    dimensions: (row.dimensions as string) || "",
    layerHeight: (row.layer_height as string) || "",
    infillDensity: (row.infill_density as string) || "",
    recommendedApplication: (row.recommended_application as string) || "",
    productionDays: (row.production_days as number) || 5,
    featured: (row.featured as boolean) || false,
    isNew: (row.is_new as boolean) || false,
  };
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,

      fetchProducts: async (limit = 50, offset = 0) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`/api/products?limit=${limit}&offset=${offset}`);
          if (!res.ok) throw new Error("API error");
          const responseData = await res.json();
          const items = Array.isArray(responseData) ? responseData : (responseData.data || []);
          if (items.length > 0) {
            set((state) => {
              // Simple infinite loading: append if offset > 0, else replace
              const newProducts = items.map(rowToProduct);
              return {
                products: offset === 0 ? newProducts : [...state.products, ...newProducts],
                isLoading: false
              };
            });
          } else {
            if (offset === 0) set({ products: [], isLoading: false });
            else set({ isLoading: false });
          }
        } catch {
          if (offset === 0) set({ products: [], isLoading: false });
          else set({ isLoading: false });
        }
      },

      updatePrice: (productId, newPrice) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, price: newPrice } : p
          ),
        }));
        // Persist to server
        const product = get().products.find((p) => p.id === productId);
        if (product) {
          fetch(`/api/products/${product.slug}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ price: newPrice }),
          }).catch(() => {
            /* silent fail — local state is already updated */
          });
        }
      },

      addProduct: async (product) => {
        set((state) => ({
          products: [product, ...state.products],
        }));

        try {
          const row = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            long_description: product.longDescription,
            price: product.price,
            price_label: product.priceLabel || null,
            category: product.category,
            image: product.image,
            images: product.images,
            badge: product.badge || null,
            materials: product.materials,
            finishes: product.finishes,
            dimensions: product.dimensions,
            layer_height: product.layerHeight,
            infill_density: product.infillDensity,
            recommended_application: product.recommendedApplication,
            production_days: product.productionDays,
            featured: product.featured || false,
            is_new: product.isNew || false,
          };

          await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(row),
          });
        } catch {
          // silent fail
        }
      },

      removeProduct: (productId) => {
        const product = get().products.find((p) => p.id === productId);
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        }));
        if (product) {
          fetch(`/api/products/${product.slug}`, {
            method: "DELETE",
          }).catch(() => {
            /* silent fail — local state is already updated */
          });
        }
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
        return get()
          .products.filter((p) => p.id !== excludeId)
          .slice(0, 4);
      },

      resetToDefaults: () => {
        set({ products: [] });
      },
    }),
    {
      name: "gmk-products",
      partialize: (state) => ({ products: state.products }),
    }
  )
);
