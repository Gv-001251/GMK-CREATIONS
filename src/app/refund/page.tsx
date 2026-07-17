import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "Refund and cancellation policy for GMK 3D Creations orders and custom 3D prints.",
};

const LAST_UPDATED = "July 17, 2026";

export default function RefundPage() {
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
            Refund &amp; Cancellation Policy
          </h1>
          <p className="mt-4 text-sm text-on-surface-variant">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="mt-10 space-y-10">
            <section className="space-y-3">
              <p className="text-on-surface-variant leading-relaxed">
                At <span className="text-on-surface font-medium">GMK 3D CREATIONS</span>,
                every product is crafted with precision and care. Many of our products are
                custom-made or manufactured after an order is placed. Please read our Refund
                &amp; Cancellation Policy carefully before making a purchase.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                Order Cancellation
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Orders may be cancelled only before production or processing has begun. Once
                manufacturing, 3D printing, customization, or packaging has commenced, the
                order cannot be cancelled.
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                GMK 3D CREATIONS reserves the right to cancel any order due to:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Product unavailability</li>
                <li>Pricing or technical errors</li>
                <li>Payment verification failure</li>
                <li>Suspected fraudulent activity</li>
                <li>Circumstances beyond our reasonable control</li>
              </ul>
              <p className="text-on-surface-variant leading-relaxed">
                If we cancel an order before dispatch, the full amount paid will be refunded to
                the original payment method.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                Refund Eligibility
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Refunds will be considered only in the following situations:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>The wrong product was delivered.</li>
                <li>The product arrived damaged during transit.</li>
                <li>The product has a verified manufacturing defect.</li>
                <li>The order was cancelled by GMK 3D CREATIONS before dispatch.</li>
              </ul>
              <p className="text-on-surface-variant leading-relaxed">
                Refund requests must be submitted within{" "}
                <span className="text-on-surface font-medium">48 hours</span> of delivery,
                along with clear photographs or an unboxing video showing the issue.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                Non-Refundable Items
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Refunds will not be provided for:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Customized or personalized products.</li>
                <li>Made-to-order or special-order items.</li>
                <li>Products damaged due to improper handling or misuse.</li>
                <li>
                  Minor colour, texture, or dimensional variations inherent to the 3D printing
                  process.
                </li>
                <li>
                  Orders where incorrect shipping information was provided by the customer.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                Refund Process
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Once your request is reviewed and approved, the refund will be initiated to the
                original payment method. Refund processing typically takes{" "}
                <span className="text-on-surface font-medium">5&ndash;10 business days</span>,
                depending on your bank or payment provider.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">Contact Us</h2>
              <p className="text-on-surface-variant leading-relaxed">
                For refund or cancellation requests, please contact:
              </p>
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
                href="/returns"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Return &amp; Replacement Policy &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
