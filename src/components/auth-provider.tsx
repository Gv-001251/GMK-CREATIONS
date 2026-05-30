"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";

/**
 * Initializes Supabase auth on mount and listens for session changes.
 * Properly cleans up the auth subscription on unmount.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    initialize().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      unsubscribe?.();
    };
  }, [initialize]);

  return <>{children}</>;
}
