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
import { calculateOrderTotals, DEFAULT_ITEM_WEIGHT_GRAMS } from "@/lib/pricing";
import { ONLINE_PAYMENT_ENABLED, isCodAvailable } from "@/lib/payment-config";
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

// localStorage key used to remember the customer's shipping details between
// visits so they don't have to re-enter them for every order.
const SHIPPING_STORAGE_KEY = "gmk_shipping_info";

// All Indian states and union territories, for the checkout State dropdown.
// A fixed list guarantees a consistent value so intrastate detection is exact.
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

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
  prefill: { name: string; email: string; contact?: string; method?: string };
  theme: { color: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayFailedResponse {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayFailedResponse) => void) => void;
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
  phone: string;
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

  const [placedOrderId, setPlacedOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Per-field validation messages, keyed by ShippingInfo field name.
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ShippingInfo, string>>>({});
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  // Online payment is gated behind a feature flag while Razorpay is being
  // validated. Default to COD and prevent selecting online when disabled.
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">(
    ONLINE_PAYMENT_ENABLED ? "online" : "cod"
  );

  useEffect(() => {
    fetchProducts();
    if (typeof window !== "undefined" && window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, [fetchProducts]);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>(() => {
    const empty: ShippingInfo = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    };
    // Restore previously entered details so the customer doesn't have to type
    // them again on their next purchase.
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(SHIPPING_STORAGE_KEY);
        if (saved) return { ...empty, ...JSON.parse(saved) };
      } catch {
        // Ignore malformed saved data
      }
    }
    return empty;
  });

  // Persist the shipping details locally as they change so they survive page
  // reloads and are ready to reuse on the next order.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(shippingInfo));
    } catch {
      // Storage may be unavailable (private mode / quota) — non-fatal
    }
  }, [shippingInfo]);

  // Fill the email from the signed-in account if it hasn't been captured yet.
  useEffect(() => {
    if (user?.email) {
      setShippingInfo((prev) =>
        prev.email ? prev : { ...prev, email: user.email || "" }
      );
    }
  }, [user]);

  useEffect(() => {
    async function loadLastShippingInfo() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const orders = await res.json();
          if (Array.isArray(orders) && orders.length > 0) {
            // Find the most recent order that has shipping details filled
            const orderWithShipping = orders.find(o => o.shipping_first_name);
            if (orderWithShipping) {
              setShippingInfo({
                firstName: orderWithShipping.shipping_first_name || "",
                lastName: orderWithShipping.shipping_last_name || "",
                email: orderWithShipping.shipping_email || user?.email || "",
                phone: orderWithShipping.shipping_phone || "",
                address: orderWithShipping.shipping_address || "",
                city: orderWithShipping.shipping_city || "",
                state: orderWithShipping.shipping_state || "",
                zip: orderWithShipping.shipping_zip || "",
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to load last shipping info:", err);
      }
    }

    // Only pull from the last order when we don't already have details saved
    // locally, so we never overwrite what the customer just entered.
    const hasSavedInfo =
      typeof window !== "undefined" && !!localStorage.getItem(SHIPPING_STORAGE_KEY);

    if (user && !hasSavedInfo) {
      loadLastShippingInfo();
    }
  }, [user]);


  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Total order weight (grams) — look each item's weight up from the catalog,
  // falling back to a default when a product has no recorded weight or is a
  // custom upload. Drives the weight-based delivery charge.
  const totalWeight = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    const itemWeight =
      product?.weight && product.weight > 0
        ? product.weight
        : DEFAULT_ITEM_WEIGHT_GRAMS;
    return sum + itemWeight * item.quantity;
  }, 0);

  const { shippingCost: shipping, grandTotal } = calculateOrderTotals(
    total,
    totalWeight,
    shippingInfo.state
  );

  // Cash on Delivery is only offered within ~10km of Peelamedu, Coimbatore,
  // determined by the destination PIN code.
  const codAvailable = isCodAvailable(shippingInfo.zip);

  // If the destination isn't COD-eligible, don't leave COD selected.
  useEffect(() => {
    if (!codAvailable && paymentMethod === "cod") {
      setPaymentMethod(ONLINE_PAYMENT_ENABLED ? "online" : "cod");
    }
  }, [codAvailable, paymentMethod]);

  const steps = [
    { id: "shipping" as Step, label: "Shipping", icon: Truck },
    { id: "payment" as Step, label: "Payment", icon: CreditCard },
    { id: "review" as Step, label: "Review", icon: Shield },
  ];

  // Field format rules: phone must be a valid 10-digit Indian mobile number,
  // ZIP must be a 6-digit Indian PIN code. Both accept digits only.
  const isValidPhone = (value: string) => /^[6-9]\d{9}$/.test(value.trim());
  const isValidZip = (value: string) => /^\d{6}$/.test(value.trim());
  const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const isShippingValid =
    shippingInfo.firstName.trim() &&
    shippingInfo.lastName.trim() &&
    isEmail(shippingInfo.email) &&
    isValidPhone(shippingInfo.phone) &&
    shippingInfo.address.trim() &&
    shippingInfo.city.trim() &&
    shippingInfo.state.trim() &&
    isValidZip(shippingInfo.zip);

  const updateShipping = (field: keyof ShippingInfo, value: string) => {
    // Restrict phone and ZIP to digits only, capped at their expected lengths.
    let nextValue = value;
    if (field === "phone") nextValue = value.replace(/\D/g, "").slice(0, 10);
    if (field === "zip") nextValue = value.replace(/\D/g, "").slice(0, 6);
    setShippingInfo((prev) => ({ ...prev, [field]: nextValue }));
    setError("");
    // Clear this field's error as soon as the customer edits it.
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Validate every shipping field and return a map of field → error message.
  const validateShipping = (): Partial<Record<keyof ShippingInfo, string>> => {
    const errs: Partial<Record<keyof ShippingInfo, string>> = {};

    if (!shippingInfo.firstName.trim()) errs.firstName = "First name is required";
    if (!shippingInfo.lastName.trim()) errs.lastName = "Last name is required";

    if (!shippingInfo.email.trim()) errs.email = "Email is required";
    else if (!isEmail(shippingInfo.email)) errs.email = "Enter a valid email address (e.g. name@example.com)";

    if (!shippingInfo.phone.trim()) errs.phone = "Phone number is required";
    else if (!isValidPhone(shippingInfo.phone)) errs.phone = "Enter a valid 10-digit mobile number";

    if (!shippingInfo.address.trim()) errs.address = "Address is required";
    if (!shippingInfo.city.trim()) errs.city = "City is required";
    if (!shippingInfo.state.trim()) errs.state = "Please select a state";

    if (!shippingInfo.zip.trim()) errs.zip = "PIN code is required";
    else if (!isValidZip(shippingInfo.zip)) errs.zip = "Enter a valid 6-digit PIN code";

    return errs;
  };

  const handleContinueToPayment = () => {
    const errs = validateShipping();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError("Please fix the highlighted fields below.");
      return;
    }
    setError("");
    setCurrentStep("payment");
  };

  // Shared input class that turns red when the field has a validation error.
  const fieldClass = (field: keyof ShippingInfo) =>
    `w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none transition-all ${
      fieldErrors[field]
        ? "ring-2 ring-destructive/50 focus:ring-destructive/50"
        : "focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/20"
    }`;

  const handlePlaceOrder = async () => {
    if (!razorpayLoaded && paymentMethod === "online") {
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
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      if (paymentMethod === "cod") {
        // Cash on delivery immediately succeeds on checkout!
        setPlacedOrderId(data.orderId);
        setOrderPlaced(true);
        clearCart();
        setLoading(false);
        return;
      }

      // 2. Open Razorpay checkout modal (for online payment)
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
          contact: shippingInfo.phone,
          // No forced method — let the customer pick Card, UPI, Netbanking, or
          // Wallet. Forcing "upi" opened the QR-only flow on desktop.
        },
        theme: { color: "#6d5cff" },
        modal: {
          ondismiss: async () => {
            // Delete the abandoned order from the backend so it doesn't show as pending
            try {
              await fetch(`/api/orders/${data.orderId}`, {
                method: "DELETE",
              });
            } catch (err) {
              console.error("Failed to delete abandoned order", err);
            }
            setLoading(false);
            setError("Payment was cancelled. Please try again when you're ready.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: RazorpayFailedResponse) => {
        setError(response.error?.description || "Payment failed. Please try again.");
      });
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
        onError={() => setError("Failed to load Razorpay SDK. Please check your internet connection or disable ad-blockers.")}
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
                        className={fieldClass("firstName")}
                        placeholder="John"
                        required
                        id="shipping-first-name"
                      />
                      {fieldErrors.firstName && (
                        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {fieldErrors.firstName}
                        </p>
                      )}
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
                        className={fieldClass("lastName")}
                        placeholder="Doe"
                        required
                        id="shipping-last-name"
                      />
                      {fieldErrors.lastName && (
                        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {fieldErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => updateShipping("email", e.target.value)}
                        className={fieldClass("email")}
                        placeholder="john@example.com"
                        required
                        id="shipping-email"
                      />
                      {fieldErrors.email && (
                        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        value={shippingInfo.phone}
                        onChange={(e) => updateShipping("phone", e.target.value)}
                        className={fieldClass("phone")}
                        placeholder="10-digit mobile number"
                        required
                        id="shipping-phone"
                      />
                      {fieldErrors.phone && (
                        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {fieldErrors.phone}
                        </p>
                      )}
                    </div>
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
                      className={fieldClass("address")}
                      placeholder="123 Main St"
                      required
                      id="shipping-address"
                    />
                    {fieldErrors.address && (
                      <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {fieldErrors.address}
                      </p>
                    )}
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
                        className={fieldClass("city")}
                        placeholder="City"
                        required
                        id="shipping-city"
                      />
                      {fieldErrors.city && (
                        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {fieldErrors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">
                        State *
                      </label>
                      <select
                        value={shippingInfo.state}
                        onChange={(e) => updateShipping("state", e.target.value)}
                        className={`${fieldClass("state")} appearance-none cursor-pointer`}
                        required
                        id="shipping-state"
                      >
                        <option value="" disabled>
                          Select state
                        </option>
                        {INDIAN_STATES.map((stateName) => (
                          <option key={stateName} value={stateName}>
                            {stateName}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.state && (
                        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {fieldErrors.state}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={shippingInfo.zip}
                        onChange={(e) => updateShipping("zip", e.target.value)}
                        className={fieldClass("zip")}
                        placeholder="6-digit PIN code"
                        required
                        id="shipping-zip"
                      />
                      {fieldErrors.zip && (
                        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {fieldErrors.zip}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleContinueToPayment}
                    className="w-full py-4 rounded-full gradient-primary text-white font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all mt-4"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Online Payment */}
                    <button
                      onClick={() => ONLINE_PAYMENT_ENABLED && setPaymentMethod("online")}
                      disabled={!ONLINE_PAYMENT_ENABLED}
                      aria-disabled={!ONLINE_PAYMENT_ENABLED}
                      className={`relative p-6 rounded-2xl text-left border-2 transition-all ${
                        !ONLINE_PAYMENT_ENABLED
                          ? "bg-surface-container-low border-outline-variant opacity-60 cursor-not-allowed"
                          : paymentMethod === "online"
                          ? "bg-primary/5 border-primary shadow-sm"
                          : "bg-surface-container-low border-outline-variant hover:bg-surface-container"
                      }`}
                      type="button"
                    >
                      {!ONLINE_PAYMENT_ENABLED && (
                        <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-surface-container text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant border border-outline-variant">
                          Coming Soon
                        </span>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2.5 rounded-xl ${paymentMethod === "online" ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant"}`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="font-heading font-bold text-sm text-on-surface">Online Payment</span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {ONLINE_PAYMENT_ENABLED
                          ? "Pay securely with UPI, Cards, Wallets, or Net Banking via Razorpay."
                          : "Online payment is temporarily unavailable. Please use Cash on Delivery."}
                      </p>
                    </button>

                    {/* Cash on Delivery — only within ~10km of Peelamedu */}
                    <button
                      onClick={() => codAvailable && setPaymentMethod("cod")}
                      disabled={!codAvailable}
                      aria-disabled={!codAvailable}
                      className={`relative p-6 rounded-2xl text-left border-2 transition-all ${
                        !codAvailable
                          ? "bg-surface-container-low border-outline-variant opacity-60 cursor-not-allowed"
                          : paymentMethod === "cod"
                          ? "bg-primary/5 border-primary shadow-sm"
                          : "bg-surface-container-low border-outline-variant hover:bg-surface-container"
                      }`}
                      type="button"
                    >
                      {!codAvailable && (
                        <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-surface-container text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant border border-outline-variant">
                          Local only
                        </span>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2.5 rounded-xl ${paymentMethod === "cod" ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant"}`}>
                          <Truck className="w-5 h-5" />
                        </div>
                        <span className="font-heading font-bold text-sm text-on-surface">Cash on Delivery</span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {codAvailable
                          ? "Pay in cash upon delivery at your doorstep. Safe and convenient."
                          : "Available only within ~10km of Peelamedu, Coimbatore. Please pay online."}
                      </p>
                    </button>
                  </div>

                  {paymentMethod === "online" ? (
                    <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Secure Payment</span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Your online payment is fully encrypted using standard 256-bit SSL protocols and processed safely through Razorpay&apos;s trusted network.
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant">
                      <div className="flex items-center gap-3 mb-3">
                        <Truck className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">COD Option Selected</span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        No immediate payment required! Just ensure you have the cash ready when the delivery partner arrives with your order.
                      </p>
                    </div>
                  )}

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
                      {shippingInfo.email} · {shippingInfo.phone}
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
                          key={`${item.productId}-${item.material}-${item.finish}-${item.primaryColor || ""}-${item.secondaryColor || ""}`}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low"
                        >
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-container-highest shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                              unoptimized={item.image.startsWith("http") || item.image.startsWith("data:")}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-heading text-sm font-semibold text-on-surface truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-on-surface-variant">
                              {item.material} · {item.finish}
                            </p>
                            {item.primaryColor && (
                              <p className="text-[10px] text-on-surface-variant/80 mt-0.5">
                                Color: {item.secondaryColor ? `${item.primaryColor} / ${item.secondaryColor}` : item.primaryColor}
                              </p>
                            )}
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
                    ) : paymentMethod === "cod" ? (
                      <>Confirm Order (₹{grandTotal.toFixed(2)})</>
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
                      key={`${item.productId}-${item.material}-${item.finish}-${item.primaryColor || ""}-${item.secondaryColor || ""}`}
                      className="flex justify-between text-sm items-start gap-4"
                    >
                      <div className="text-on-surface-variant">
                        <span className="font-medium text-on-surface">{item.name}</span>
                        <span className="block text-[11px] text-on-surface-variant/70 mt-0.5">
                          {item.material} · {item.finish}
                          {item.primaryColor && ` (${item.secondaryColor ? `${item.primaryColor}/${item.secondaryColor}` : item.primaryColor})`}
                        </span>
                      </div>
                      <span className="font-medium shrink-0">
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
                    <span className="text-on-surface-variant">
                      Shipping{!shippingInfo.state ? " (est.)" : ""}
                    </span>
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
