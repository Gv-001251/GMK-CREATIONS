import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart | GMK 3D Creations",
  description: "View and manage items in your shopping cart.",
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
