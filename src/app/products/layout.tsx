import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalog | GMK 3D Creations",
  description:
    "Browse our premium 3D printed products — miniatures, prototypes, custom parts, and functional art.",
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
