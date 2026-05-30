import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart | GMK 3D Creations",
  description: "Review your cart and proceed to checkout.",
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
