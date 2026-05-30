import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0e0e12] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-8xl font-bold text-[#c9f455] mb-4 font-[family-name:var(--font-heading)]">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-white mb-3 font-[family-name:var(--font-heading)]">
          Page not found
        </h2>
        <p className="text-[#a0a0b0] mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#c9f455] text-[#0e0e12] rounded-xl font-semibold hover:brightness-110 transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#2a2a35] text-white rounded-xl font-semibold hover:bg-[#1a1a24] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
