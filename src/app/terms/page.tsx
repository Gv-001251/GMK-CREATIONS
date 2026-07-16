import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms and conditions governing purchases, custom 3D printing orders, and use of the GMK 3D Creations website.",
};

const LAST_UPDATED = "July 16, 2026";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-on-surface">
      <Navbar />

      <section className="relative overflow-hidden px-4 sm:px-6 pt-28 pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.10),_transparent_28%)]" />

        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">
            Legal
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-on-surface">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-sm text-on-surface-variant">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="mt-10 space-y-10">
            <section className="space-y-3">
              <p className="text-on-surface-variant leading-relaxed">
                These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use of the
                GMK 3D Creations website, and any purchase or custom 3D printing order placed
                through it. By using our website or placing an order, you agree to these Terms.
                If you do not agree, please do not use the website.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">1. About Us</h2>
              <p className="text-on-surface-variant leading-relaxed">
                &quot;GMK 3D Creations&quot; (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a custom 3D printing and
                product studio based in Coimbatore, Tamil Nadu, India. References to &quot;you&quot; or
                &quot;the customer&quot; mean any person who accesses the website or places an order.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                2. Products &amp; Custom Orders
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                We offer both catalog products and custom 3D prints produced from files you
                upload. Because items are printed to order, colours, finishes, dimensions, and
                surface texture may vary slightly from images or on-screen previews. Estimated
                weights, print times, and prices shown for uploaded models are approximate and
                may be adjusted before production if a model requires it; we will confirm any
                material change with you first.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                3. Pricing &amp; Payment
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                All prices are listed in Indian Rupees (₹) and are inclusive of applicable
                taxes unless stated otherwise. Online payments are processed securely through
                our payment partner, Razorpay. We do not store your card, UPI, or banking
                details on our servers. An order is confirmed only after payment is
                successfully verified, or, for cash-on-delivery orders, when the order is
                placed.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                4. Order Confirmation &amp; Cancellation
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Once an order is confirmed you will receive an email confirmation. You may
                request cancellation while an order is still &quot;pending&quot; or &quot;confirmed&quot; and
                before production begins. Once a custom print has entered production it cannot
                usually be cancelled, as the item is made specifically for you. We reserve the
                right to decline or cancel any order — for example, where a file cannot be
                printed safely, is fraudulent, or infringes the rights of others — and to
                refund any amount paid in such cases.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                5. Uploaded Files &amp; Intellectual Property
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                By uploading a model, you confirm that you own the design or have all rights
                and permissions necessary to have it printed. You remain the owner of your
                uploaded files, and we use them solely to fulfil your order. We will not
                reproduce, share, or sell your files without your permission. All website
                content — including our catalog designs, images, logos, and text — remains the
                property of GMK 3D Creations and may not be copied or reused without written
                consent.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                6. Shipping &amp; Delivery
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Production timelines are estimates and begin after order confirmation. Delivery
                times depend on the shipping destination and courier. We are not responsible
                for delays caused by couriers, incorrect shipping details provided by the
                customer, or events beyond our reasonable control.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                7. Returns, Refunds &amp; Replacements
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                As custom prints are made to order, they are generally non-returnable. However,
                if your item arrives damaged, defective, or materially different from what was
                ordered, contact us within 48 hours of delivery with photographs and we will
                arrange a replacement or refund where appropriate. Refunds for eligible orders
                are processed to the original payment method through Razorpay and may take a
                few business days to reflect.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                8. Limitation of Liability
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                To the maximum extent permitted by law, our total liability for any claim
                relating to an order is limited to the amount you paid for that order. We are
                not liable for indirect or consequential losses. Nothing in these Terms limits
                any rights you have under applicable consumer protection law.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                9. Governing Law &amp; Jurisdiction
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                These Terms are governed by the laws of India. Any disputes shall be subject to
                the exclusive jurisdiction of the courts of Coimbatore, Tamil Nadu.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                10. Changes to These Terms
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                We may update these Terms from time to time. The &quot;Last updated&quot; date above
                reflects the most recent revision. Continued use of the website after changes
                are posted constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">11. Contact Us</h2>
              <p className="text-on-surface-variant leading-relaxed">
                For any questions about these Terms, please reach out:
              </p>
              <ul className="text-on-surface-variant leading-relaxed space-y-1">
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
                  <a href="tel:+919344581320" className="text-primary hover:underline">
                    (+91) 93445 81320
                  </a>{" "}
                  ·{" "}
                  <a href="tel:+919944215100" className="text-primary hover:underline">
                    (+91) 99442 15100
                  </a>
                </li>
                <li>
                  Address: 31/12, Rajagopal Layout, Avarampalayam Road, Peelamedu,
                  Coimbatore - 641 004.
                </li>
              </ul>
            </section>

            <div className="pt-4">
              <Link
                href="/privacy"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Read our Privacy Policy →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
