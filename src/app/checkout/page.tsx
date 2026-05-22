"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Navbar } from "@/components/navbar";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useProductsStore } from "@/lib/store/products-store";
import { getDeliveryEstimate } from "@/lib/utils/date-estimator";
import { AuthGuard } from "@/components/auth-guard";
import {
  ChevronRight,
  CreditCard,
  Truck,
  Shield,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

type Step = "shipping" | "payment" | "review";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string };
  theme: { color: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

function CheckoutContent() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { products, fetchProducts } = useProductsStore();
  const [currentStep, setCurrentStep] = useState<Step>("shipping");
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });


  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = total > 100 ? 0 : 12.99;
  const grandTotal = total + shipping;

  const steps = [
    { id: "shipping" as Step, label: "Shipping", icon: Truck },
    { id: "payment" as Step, label: "Payment", icon: CreditCard },
    { id: "review" as Step, label: "Review", icon: Shield },
  ];

  const isShippingValid =
    shippingInfo.firstName.trim() &&
    shippingInfo.lastName.trim() &&
    shippingInfo.email.trim() &&
    shippingInfo.address.trim() &&
    shippingInfo.city.trim() &&
    shippingInfo.state.trim() &&
    shippingInfo.zip.trim();

  const updateShipping = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleContinueToPayment = () => {
    if (!isShippingValid) {
      setError("Please fill in all shipping fields");
      return;
    }
    setError("");
    setCurrentStep("payment");
  };

  const handlePlaceOrder = async () => {
    if (!razorpayLoaded) {
      setError("Payment system is loading. Please try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Create order on server (Razorpay + Supabase)
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping,
          shippingInfo,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      // 2. Open Razorpay checkout modal
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: data.currency,
        name: "GMK — 3D CREATIONS",
        description: `Order ${data.orderId}`,
        order_id: data.razorpayOrderId,
        handler: async (response: RazorpayResponse) => {
          // 3. Verify payment on server
          try {
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                orderId: data.orderId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok)
              throw new Error(verifyData.error || "Payment verification failed");

            // Success!
            setPlacedOrderId(data.orderId);
            setOrderPlaced(true);
            clearCart();
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Payment verification failed"
            );
          }
          setLoading(false);
        },
        prefill: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          email: shippingInfo.email,
        },
        theme: { color: "#6d5cff" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment was cancelled. Your order is saved — you can try again.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to initiate payment"
      );
      setLoading(false);
    }
  };

  // ──── Order Confirmed ────
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
            <p className="text-on-surface-variant leading-relaxed mb-2">
              Your precision prints are being prepared. You&apos;ll receive a
              confirmation email with tracking details shortly.
            </p>
            {placedOrderId && (
              <p className="text-sm font-mono text-primary mb-8">
                Order ID: {placedOrderId}
              </p>
            )}
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

  // ──── Checkout Flow ────
  return (
    <main>
      <Navbar />

      {/* Razorpay checkout script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8">
            <Link href="/cart" className="hover:text-primary transition-colors">
              Cart
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-on-surface font-medium">Checkout</span>
          </nav>

          <h1 className="font-heading text-4xl font-bold text-on-surface tracking-tight mb-10">
            Checkout
          </h1>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive mb-8 animate-slide-down">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Step Indicators */}
          <div className="flex items-center gap-4 mb-12">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (step.id === "shipping") setCurrentStep("shipping");
                    if (step.id === "payment" && isShippingValid)
                      setCurrentStep("payment");
                    if (step.id === "review" && isShippingValid)
                      setCurrentStep("review");
                  }}
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
              {/* ──── Shipping Step ──── */}
              {currentStep === "shipping" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-xl font-bold text-on-surface">
                    Shipping Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.firstName}
                        onChange={(e) =>
                          updateShipping("firstName", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="John"
                        required
                        id="shipping-first-name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.lastName}
                        onChange={(e) =>
                          updateShipping("lastName", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Doe"
                        required
                        id="shipping-last-name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => updateShipping("email", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="john@example.com"
                      required
                      id="shipping-email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) =>
                        updateShipping("address", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="123 Main St"
                      required
                      id="shipping-address"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => updateShipping("city", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="City"
                        required
                        id="shipping-city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.state}
                        onChange={(e) => updateShipping("state", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="State"
                        required
                        id="shipping-state"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.zip}
                        onChange={(e) => updateShipping("zip", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="10001"
                        required
                        id="shipping-zip"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleContinueToPayment}
                    disabled={!isShippingValid}
                    className="w-full py-4 rounded-full gradient-primary text-white font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {/* ──── Payment Step ──── */}
              {currentStep === "payment" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-xl font-bold text-on-surface">
                    Payment Method
                  </h2>
                  <div className="p-6 rounded-2xl bg-surface-container-low border-2 border-primary/20">
                    <div className="flex items-center gap-3 mb-4">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="font-medium text-on-surface">
                        Razorpay Secure Payment
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Your payment will be processed securely via Razorpay.
                      You&apos;ll be prompted to complete payment using
                      UPI, credit/debit card, net banking, or wallet when you
                      place the order.
                    </p>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-outline-variant">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs text-on-surface-variant">
                        256-bit SSL encrypted · PCI DSS compliant
                      </span>
                    </div>
                  </div>

                  {/* Shipping Summary */}
                  <div className="p-5 rounded-2xl bg-surface-container-low">
                    <h3 className="text-sm font-semibold text-on-surface mb-3">
                      Shipping To
                    </h3>
                    <p className="text-sm text-on-surface-variant">
                      {shippingInfo.firstName} {shippingInfo.lastName}
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      {shippingInfo.address}
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      {shippingInfo.city}, {shippingInfo.state}{" "}
                      {shippingInfo.zip}
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      {shippingInfo.email}
                    </p>
                  </div>

                  <button
                    onClick={() => setCurrentStep("review")}
                    className="w-full py-4 rounded-full gradient-primary text-white font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all mt-4"
                  >
                    Review Order
                  </button>
                </div>
              )}

              {/* ──── Review Step ──── */}
              {currentStep === "review" && (
                <div className="space-y-6">
                  <h2 className="font-heading text-xl font-bold text-on-surface">
                    Review Order
                  </h2>
                  <div className="space-y-3">
                    {items.map((item) => {
                      const product = products.find((p) => p.id === item.productId);
                      const productionDays = product?.productionDays ?? 5;
                      const estArrival = getDeliveryEstimate(productionDays);
                      return (
                        <div
                          key={`${item.productId}-${item.material}-${item.finish}`}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low"
                        >
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-container-highest shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              unoptimized={item.image.startsWith("http")}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-heading text-sm font-semibold text-on-surface truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-on-surface-variant">
                              {item.material} · {item.finish}
                            </p>
                            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                              Estimated Arrival: {estArrival}
                            </p>
                          </div>
                          <span className="font-semibold shrink-0">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-full gradient-primary text-white font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    id="place-order-button"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Pay ₹{grandTotal.toFixed(2)} with Razorpay</>
                    )}
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
                    <div
                      key={`${item.productId}-${item.material}-${item.finish}`}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-on-surface-variant">
                        {item.name}
                      </span>
                      <span className="font-medium">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-4 border-t border-outline-variant">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span className="font-medium">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-outline-variant">
                  <span className="font-heading font-bold">Total</span>
                  <span className="font-heading font-bold text-xl">
                    ₹{grandTotal.toFixed(2)}
                  </span>
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
