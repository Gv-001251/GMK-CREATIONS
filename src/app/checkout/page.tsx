"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useAdminStore } from "@/lib/store/admin-store";
import { AuthGuard } from "@/components/auth-guard";
import { ChevronRight, CreditCard, Truck, Shield, Check } from "lucide-react";

type Step = "shipping" | "payment" | "review";

function CheckoutContent() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { addOrder } = useAdminStore();
  const [currentStep, setCurrentStep] = useState<Step>("shipping");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = total > 100 ? 0 : 12.99;
  const grandTotal = total + shipping;

  const steps = [
    { id: "shipping" as Step, label: "Shipping", icon: Truck },
    { id: "payment" as Step, label: "Payment", icon: CreditCard },
    { id: "review" as Step, label: "Review", icon: Shield },
  ];

  const handlePlaceOrder = () => {
    // Record order in admin store
    if (user) {
      addOrder({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          material: item.material,
          finish: item.finish,
        })),
        total,
        shipping,
        grandTotal,
      });
    }
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <main>
        <Navbar />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-on-surface mb-3">
              Order Confirmed!
            </h1>
            <p className="text-on-surface-variant leading-relaxed mb-8">
              Your precision prints are being prepared. You&apos;ll receive a confirmation email with tracking details shortly.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full gradient-primary text-white font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8">
            <Link href="/cart" className="hover:text-primary transition-colors">Cart</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-on-surface font-medium">Checkout</span>
          </nav>

          <h1 className="font-heading text-4xl font-bold text-on-surface tracking-tight mb-10">
            Checkout
          </h1>

          {/* Step Indicators */}
          <div className="flex items-center gap-4 mb-12">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    currentStep === step.id
                      ? "gradient-primary text-white"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                  {step.label}
                </button>
                {i < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form Area */}
            <div className="lg:col-span-2">
              {currentStep === "shipping" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-xl font-bold text-on-surface">
                    Shipping Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">First Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">Last Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Address</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">City</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">State</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">ZIP Code</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentStep("payment")}
                    className="w-full py-4 rounded-full gradient-primary text-white font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all mt-4"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {currentStep === "payment" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-xl font-bold text-on-surface">
                    Payment Method
                  </h2>
                  <div className="p-5 rounded-2xl bg-surface-container-low border-2 border-primary/20">
                    <div className="flex items-center gap-3 mb-4">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="font-medium text-on-surface">Credit / Debit Card</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Card Number</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-xl bg-surface-container text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="4242 4242 4242 4242"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-on-surface mb-2">Expiry</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl bg-surface-container text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-on-surface mb-2">CVC</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl bg-surface-container text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentStep("review")}
                    className="w-full py-4 rounded-full gradient-primary text-white font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all mt-4"
                  >
                    Review Order
                  </button>
                </div>
              )}

              {currentStep === "review" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-xl font-bold text-on-surface">
                    Review Order
                  </h2>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-container-highest">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-heading text-sm font-semibold">{item.name}</h4>
                          <p className="text-xs text-on-surface-variant">{item.material} · {item.finish} · Qty: {item.quantity}</p>
                        </div>
                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full py-4 rounded-full gradient-primary text-white font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all mt-4"
                    id="place-order-button"
                  >
                    Place Order — ${grandTotal.toFixed(2)}
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 p-6 rounded-2xl bg-surface-container-low">
                <h3 className="font-heading text-lg font-bold text-on-surface mb-6">
                  Order Summary
                </h3>
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-4 border-t border-outline-variant">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-outline-variant">
                  <span className="font-heading font-bold">Total</span>
                  <span className="font-heading font-bold text-xl">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutContent />
    </AuthGuard>
  );
}
