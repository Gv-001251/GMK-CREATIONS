import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders | GMK 3D Creations",
  description: "Track and manage your orders — view history, check status, and cancel if needed.",
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
