"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";

/**
 * Initializes Supabase auth on mount and listens for session changes.
 * Wrap the app tree with this provider in the root layout.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
