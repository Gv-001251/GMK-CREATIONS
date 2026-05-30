"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0e0e12] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-rose-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3 font-[family-name:var(--font-heading)]">
          Something went wrong
        </h1>
        <p className="text-[#a0a0b0] mb-8 leading-relaxed">
          An unexpected error occurred. Please try again or return to the home page.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#c9f455] text-[#0e0e12] rounded-xl font-semibold hover:brightness-110 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#2a2a35] text-white rounded-xl font-semibold hover:bg-[#1a1a24] transition-all"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
