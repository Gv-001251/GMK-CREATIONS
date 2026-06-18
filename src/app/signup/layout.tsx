import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | GMK 3D Creations",
  description: "Create an account to start shopping premium 3D printed products.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
