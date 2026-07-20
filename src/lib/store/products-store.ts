import { create } from "zustand";
import { type Product, products as defaultProducts } from "@/lib/data/products";
import { rowToProduct } from "@/lib/utils/product-mapper";

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  fetchProducts: (limit?: number, offset?: number) => Promise<void>;
  updatePrice: (productId: string, newPrice: number) => Promise<void>;
  updateProduct: (slug: string, product: Partial<Product>) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  getFeaturedProducts: () => Product[];
  getRecommendedProducts: (excludeId?: string | string[]) => Product[];
  resetToDefaults: () => void;
}

function mergeProducts(baseProducts: Product[], incomingProducts: Product[]): Product[] {
  const productMap = new Map<string, Product>();

  for (const product of baseProducts) {
    productMap.set(product.id, product);
  }

  for (const product of incomingProducts) {
    productMap.set(product.id, product);
  }

  return Array.from(productMap.values());
}

export const useProductsStore = create<ProductsState>()(
  (set, get) => ({
    products: defaultProducts,
    isLoading: false,

    fetchProducts: async (limit = 1000, offset = 0) => {
      set({ isLoading: true });
      try {
        // Page through the whole catalog. PostgREST caps each response (default
        // 1000 rows), so a single request would silently drop products once the
        // catalog grows. We keep requesting pages until every row — per the
        // reported `count` — has been collected.
        const pageSize = Math.min(Math.max(limit, 1), 1000);
        let from = offset;
        let total: number | undefined;
        const collected: Record<string, unknown>[] = [];

        for (;;) {
          const res = await fetch(`/api/products?limit=${pageSize}&offset=${from}`);
          if (!res.ok) throw new Error("API error");
          const responseData = await res.json();
          const items: Record<string, unknown>[] = Array.isArray(responseData)
            ? responseData
            : responseData.data || [];
          if (typeof responseData?.count === "number") total = responseData.count;

          collected.push(...items);
          from += items.length;

          const reachedEnd =
            items.length < pageSize ||
            (typeof total === "number" && collected.length >= total);
          if (reachedEnd || items.length === 0) break;
        }

        if (collected.length > 0) {
          const newProducts = collected.map(rowToProduct);
          set((state) => ({
            // The database is the source of truth for the catalog. When loading
            // from the start we replace the list entirely (so products deleted in
            // the DB no longer appear and can't be ordered); otherwise append.
            products: offset === 0 ? newProducts : mergeProducts(state.products, newProducts),
            isLoading: false,
          }));
        } else {
          // DB returned nothing — fall back to bundled defaults so the store isn't empty
          if (offset === 0) set({ products: defaultProducts, isLoading: false });
          else set({ isLoading: false });
        }
      } catch {
        if (offset === 0) set({ products: defaultProducts, isLoading: false });
        else set({ isLoading: false });
      }
    },

    updatePrice: async (productId, newPrice) => {
      const product = get().products.find((p) => p.id === productId);
      if (!product) return;

      // Optimistic update
      set((state) => ({
        products: state.products.map((p) =>
          p.id === productId ? { ...p, price: newPrice } : p
        ),
      }));

      try {
        const res = await fetch(`/api/products/${product.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price: newPrice }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update price");
        }
      } catch (err) {
        // Revert optimistic update on failure
        await get().fetchProducts();
        throw err;
      }
    },

    updateProduct: async (slug, product) => {
      // Convert camelCase to snake_case for DB
      const row: Record<string, unknown> = {};
      if (product.name !== undefined) row.name = product.name;
      if (product.slug !== undefined) row.slug = product.slug;
      if (product.description !== undefined) row.description = product.description;
      if (product.longDescription !== undefined) row.long_description = product.longDescription;
      if (product.price !== undefined) row.price = product.price;
      if (product.priceLabel !== undefined) row.price_label = product.priceLabel || null;
      if (product.category !== undefined) row.category = product.category;
      if (product.image !== undefined) row.image = product.image;
      if (product.images !== undefined) row.images = product.images;
      if (product.badge !== undefined) row.badge = product.badge || null;
      if (product.materials !== undefined) row.materials = product.materials;
      if (product.finishes !== undefined) row.finishes = product.finishes;
      if (product.layerHeight !== undefined) row.layer_height = product.layerHeight;
      if (product.infillDensity !== undefined) row.infill_density = product.infillDensity;
      if (product.recommendedApplication !== undefined) row.recommended_application = product.recommendedApplication;
      if (product.productionDays !== undefined) row.production_days = product.productionDays;
      if (product.weight !== undefined) row.weight = product.weight;
      if (product.featured !== undefined) row.featured = product.featured;
      if (product.isNew !== undefined) row.is_new = product.isNew;

      const res = await fetch(`/api/products/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update product");
      }

      // Re-fetch from DB to ensure local state matches
      await get().fetchProducts();
    },

    addProduct: async (product) => {
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
        layer_height: product.layerHeight,
        infill_density: product.infillDensity,
        recommended_application: product.recommendedApplication,
        production_days: product.productionDays,
        weight: product.weight || 0,
        featured: product.featured || false,
        is_new: product.isNew || false,
      };

      // Insert into DB first — only update local state on success
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save product to database");
      }

      // Re-fetch from DB to ensure local state matches the DB exactly
      await get().fetchProducts();
    },

    removeProduct: async (productId) => {
      const product = get().products.find((p) => p.id === productId);
      if (!product) return;

      // Optimistic removal
      set((state) => ({
        products: state.products.filter((p) => p.id !== productId),
      }));

      try {
        const res = await fetch(`/api/products/${product.slug}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to delete product");
        }
      } catch (err) {
        // Revert on failure
        await get().fetchProducts();
        throw err;
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
      const excludeIds = Array.isArray(excludeId)
        ? excludeId
        : excludeId
        ? [excludeId]
        : [];
      return get()
        .products.filter((p) => !excludeIds.includes(p.id))
        .slice(0, 4);
    },

    resetToDefaults: () => {
      set({ products: [] });
    },
  })
);
