"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { AuthProvider } from "@/components/auth-provider";
import { ToastContainer } from "@/components/toast";
import { FloatingUploadWidget } from "@/components/floating-upload-widget";

const Preloader = dynamic(
  () => import("@/components/preloader").then((mod) => mod.Preloader),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Preloader />
      <ToastContainer />
      <FloatingUploadWidget />
      {children}
    </AuthProvider>
  );
}
