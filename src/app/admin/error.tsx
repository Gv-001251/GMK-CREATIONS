"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin panel error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6 p-8">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="font-heading text-xl font-bold text-on-surface">
          Something went wrong
        </h2>
        <p className="text-sm text-on-surface-variant max-w-sm">
          An unexpected error occurred in the admin panel. Try reloading — if
          the issue persists, check the server logs.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-on-surface-variant/60">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-6 py-3 rounded-full gradient-primary text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}
