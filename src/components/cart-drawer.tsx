"use client";

import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { useProductsStore } from "@/lib/store/products-store";
import { getDeliveryEstimate } from "@/lib/utils/date-estimator";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const { products } = useProductsStore();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-md bg-background border-outline-variant p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="font-heading text-xl font-bold tracking-tight">
            Your Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-on-surface-variant" />
            </div>
            <p className="text-on-surface-variant text-center">
              Your cart is empty
            </p>
            <Link
              href="/products"
              onClick={closeCart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-primary text-white text-sm font-semibold"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 space-y-4">
              {items.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                const productionDays = product?.productionDays ?? 5;
                const estArrival = getDeliveryEstimate(productionDays);
                return (
                  <div
                    key={`${item.productId}-${item.material}-${item.finish}`}
                    className="flex gap-4 p-4 rounded-2xl bg-surface-container-low"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container-highest">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                        unoptimized={item.image.startsWith("http") || item.image.startsWith("data:")}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading text-sm font-semibold text-on-surface truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {item.material} · {item.finish}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                        Est. Arrival: {estArrival}
                      </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 bg-surface-container rounded-full">
                        <button
                          onClick={() => updateQuantity(item.productId, item.material, item.finish, item.quantity - 1)}
                          className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-medium w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.material, item.finish, item.quantity + 1)}
                          className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.material, item.finish)}
                    className="self-start p-2 hover:bg-destructive/10 rounded-full transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="w-4 h-4 text-on-surface-variant hover:text-destructive" />
                  </button>
                </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-6 bg-surface-container-low">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-on-surface-variant">Subtotal</span>
                <span className="text-sm font-medium">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-on-surface-variant">Shipping</span>
                <span className="text-sm text-on-surface-variant">Calculated at checkout</span>
              </div>
              <div className="flex justify-between items-center mb-6 pt-4 border-t border-outline-variant">
                <span className="font-heading font-bold">Total</span>
                <span className="font-heading font-bold text-lg">₹{total.toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-full gradient-primary text-white font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
                id="checkout-button"
              >
                Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="flex items-center justify-center w-full py-3 mt-2 rounded-full text-sm text-on-surface-variant hover:text-on-surface transition-colors"
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
