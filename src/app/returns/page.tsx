import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Return & Replacement Policy",
  description:
    "Return and replacement policy for GMK 3D Creations products.",
};

const LAST_UPDATED = "July 17, 2026";

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-background text-on-surface">
      <Navbar />

      <section className="relative overflow-hidden px-4 sm:px-6 pt-28 pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.10),_transparent_28%)]" />

        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">
            Legal
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-on-surface">
            Return &amp; Replacement Policy
          </h1>
          <p className="mt-4 text-sm text-on-surface-variant">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="mt-10 space-y-10">
            <section className="space-y-3">
              <p className="text-on-surface-variant leading-relaxed">
                Customer satisfaction is important to GMK 3D CREATIONS. If you receive an
                incorrect or damaged product, we will review your request for a replacement.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                Eligible for Replacement
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                A replacement may be approved if:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>The wrong product was delivered.</li>
                <li>The product arrived damaged during transit.</li>
                <li>The product has a verified manufacturing defect.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">Conditions</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Customers must notify us within{" "}
                <span className="text-on-surface font-medium">48 hours</span> of receiving the
                order. To process a replacement request, please provide:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Order Number</li>
                <li>Clear photographs of the product</li>
                <li>An unboxing video showing the package and product condition</li>
                <li>A brief description of the issue</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                Non-Eligible Returns
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Returns or replacements will not be accepted for:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>
                  Customized or personalized products (unless damaged or incorrect).
                </li>
                <li>
                  Products damaged due to misuse, improper handling, or accidental damage.
                </li>
                <li>
                  Minor colour, texture, layer-line, or size variations resulting from the 3D
                  printing process.
                </li>
                <li>Requests made after the specified reporting period.</li>
                <li>Products returned without prior approval.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                Replacement Process
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                After verification, GMK 3D CREATIONS will:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Replace the product, or</li>
                <li>
                  Offer another suitable resolution if a replacement is unavailable.
                </li>
              </ul>
              <p className="text-on-surface-variant leading-relaxed">
                Replacement products will be shipped at no additional cost for approved claims.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">Contact Us</h2>
              <ul className="text-on-surface-variant leading-relaxed space-y-1">
                <li className="text-on-surface font-medium">GMK 3D CREATIONS</li>
                <li>
                  Email:{" "}
                  <a
                    href="mailto:gmk3dcreations@gmail.com"
                    className="text-primary hover:underline"
                  >
                    gmk3dcreations@gmail.com
                  </a>
                </li>
                <li>
                  Phone:{" "}
                  <a href="tel:+919944215100" className="text-primary hover:underline">
                    +91 99442 15100
                  </a>
                </li>
              </ul>
            </section>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/terms"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Terms &amp; Conditions &rarr;
              </Link>
              <Link
                href="/refund"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Refund &amp; Cancellation Policy &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
