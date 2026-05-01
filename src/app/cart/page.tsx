"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Tag, LogIn } from "lucide-react";
import { useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState("");
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = total > 100 ? 0 : 12.99;
  const grandTotal = total + shipping;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <main>
      <Navbar />

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-heading text-4xl font-bold text-on-surface tracking-tight mb-10">
            Shopping Cart
          </h1>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-on-surface-variant" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-on-surface">
                Your cart is empty
              </h2>
              <p className="text-on-surface-variant text-center max-w-md">
                Looks like you haven&apos;t added any items yet. Explore our catalog to find precision-engineered creations.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full gradient-primary text-white font-semibold"
              >
                Browse Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.material}-${item.finish}`}
                    className="flex gap-5 p-5 rounded-2xl bg-surface-container-low"
                  >
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-surface-container-highest flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-heading text-base font-semibold text-on-surface">
                            {item.name}
                          </h3>
                          <p className="text-sm text-on-surface-variant mt-1">
                            {item.material} · {item.finish}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-2 hover:bg-destructive/10 rounded-full transition-colors"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4 text-on-surface-variant" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-surface-container">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1 hover:bg-surface-container-high rounded-full transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1 hover:bg-surface-container-high rounded-full transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="font-heading text-lg font-bold text-on-surface">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 p-6 rounded-2xl bg-surface-container-low">
                  <h3 className="font-heading text-lg font-bold text-on-surface mb-6">
                    Order Summary
                  </h3>

                  {/* Promo Code */}
                  <div className="flex gap-2 mb-6">
                    <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-container">
                      <Tag className="w-4 h-4 text-on-surface-variant" />
                      <input
                        type="text"
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="bg-transparent text-sm outline-none flex-1 text-on-surface placeholder:text-on-surface-variant"
                      />
                    </div>
                    <button className="px-5 py-3 rounded-xl bg-on-surface text-background text-sm font-medium hover:opacity-90 transition-opacity">
                      Apply
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-sm text-on-surface-variant">Subtotal</span>
                      <span className="text-sm font-medium">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-on-surface-variant">Shipping</span>
                      <span className="text-sm font-medium">
                        {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    {shipping === 0 && (
                      <p className="text-xs text-emerald-600 font-medium">
                        🎉 Free shipping on orders over $100
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-outline-variant mb-6">
                    <span className="font-heading font-bold text-lg">Total</span>
                    <span className="font-heading font-bold text-xl">${grandTotal.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-full gradient-primary text-white font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
                  >
                    {isAuthenticated ? (
                      <>
                        Proceed to Checkout
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        Login to Checkout
                      </>
                    )}
                  </button>

                  <Link
                    href="/products"
                    className="flex items-center justify-center w-full py-3 mt-3 rounded-full text-sm text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
