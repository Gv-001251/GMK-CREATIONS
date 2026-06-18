import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  material: string;
  finish: string;
  storagePath?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, material: string, finish: string) => void;
  updateQuantity: (productId: string, material: string, finish: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const qty = item.quantity ?? 1;
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.material === item.material && i.finish === item.finish
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.material === item.material && i.finish === item.finish
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { ...item, quantity: qty }],
            isOpen: true,
          };
        });
      },

      removeItem: (productId, material, finish) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.material === material && i.finish === finish)
          ),
        }));
      },

      updateQuantity: (productId, material, finish, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, material, finish);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.material === material && i.finish === finish
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "gmk-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
