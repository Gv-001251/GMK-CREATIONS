import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | GMK 3D Creations",
  description: "Sign in or create an account to start shopping premium 3D printed products.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
