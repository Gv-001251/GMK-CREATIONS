import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | GMK 3D Creations",
  description: "Complete your order — secure payment via Razorpay or Cash on Delivery.",
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
