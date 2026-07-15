"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { AuthProvider } from "@/components/auth-provider";
import { ToastContainer } from "@/components/toast";
import { FloatingUploadWidget } from "@/components/floating-upload-widget";

// Intercept console.error to filter out Supabase's AuthApiError about invalid/missing refresh tokens,
// which is a non-fatal developer warning that triggers Next.js's dev overlay.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const msg = args
      .map((arg) => (typeof arg === "string" ? arg : arg?.message || arg?.toString() || ""))
      .join(" ");
    
    if (
      msg.includes("AuthApiError") &&
      (msg.includes("Invalid Refresh Token") || msg.includes("Refresh Token Not Found"))
    ) {
      return;
    }
    
    if (
      args[0] &&
      typeof args[0] === "object" &&
      (args[0].name === "AuthApiError" ||
        args[0].message?.includes("Invalid Refresh Token") ||
        args[0].message?.includes("Refresh Token Not Found"))
    ) {
      return;
    }
    
    originalConsoleError.apply(console, args);
  };
}

const Preloader = dynamic(
  () => import("@/components/preloader").then((mod) => mod.Preloader),
  { ssr: false }
);

const RouteLoader = dynamic(
  () => import("@/components/route-loader").then((mod) => mod.RouteLoader),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Preloader />
      <RouteLoader />
      <ToastContainer />
      <FloatingUploadWidget />
      {children}
    </AuthProvider>
  );
}
