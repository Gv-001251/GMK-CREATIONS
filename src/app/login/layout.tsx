import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | GMK 3D Creations",
  description: "Log in to your account to track orders and manage custom 3D prints.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
