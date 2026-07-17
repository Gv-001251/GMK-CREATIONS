import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms and conditions governing purchases, custom 3D printing orders, and use of the GMK 3D Creations website.",
};

const LAST_UPDATED = "July 17, 2026";

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
                Welcome to <span className="text-on-surface font-medium">GMK 3D CREATIONS</span>.
                By accessing our website or placing an order, you agree to comply with these
                Terms &amp; Conditions. Please read them carefully before using our website or
                purchasing our products.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">1. About Us</h2>
              <p className="text-on-surface-variant leading-relaxed">
                GMK 3D CREATIONS specializes in designing and manufacturing premium 3D printed
                miniatures, idols, figurines, collectibles, home d&eacute;cor items, personalized
                gifts, and custom-made products.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                2. Acceptance of Terms
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                By using this website, creating an account, or placing an order, you agree to
                be legally bound by these Terms &amp; Conditions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                3. Product Information
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                We strive to ensure all product descriptions, specifications, dimensions, and
                images are accurate. However, due to the nature of 3D printing:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Slight color variations may occur.</li>
                <li>Surface texture may vary depending on the printing process.</li>
                <li>Minor dimensional differences (&plusmn;2&ndash;5 mm) are considered acceptable.</li>
                <li>Images are for representation purposes only.</li>
              </ul>
              <p className="text-on-surface-variant leading-relaxed">
                These variations shall not be considered manufacturing defects.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                4. Customized &amp; Personalized Products
              </h2>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>
                  Many of our products are manufactured only after an order is placed.
                </li>
                <li>
                  Customized or personalized products cannot be cancelled, exchanged, or
                  returned once production has started.
                </li>
                <li>
                  Customers are responsible for providing accurate customization details before
                  confirming the order.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">5. Pricing</h2>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>All prices are displayed in Indian Rupees (INR).</li>
                <li>Prices are inclusive of applicable taxes unless otherwise stated.</li>
                <li>Prices may change without prior notice.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">6. Orders</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Orders are confirmed only after successful payment. GMK 3D CREATIONS reserves
                the right to reject or cancel any order in cases including but not limited to:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Pricing errors</li>
                <li>Product unavailability</li>
                <li>Fraudulent transactions</li>
                <li>Technical errors</li>
                <li>Violation of these Terms</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">7. Payment</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Payments are securely processed through trusted payment gateways including
                Razorpay. GMK 3D CREATIONS never stores your:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Credit Card Details</li>
                <li>Debit Card Details</li>
                <li>CVV</li>
                <li>UPI PIN</li>
                <li>Internet Banking Credentials</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                8. Manufacturing Time
              </h2>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Production begins only after payment confirmation.</li>
                <li>
                  Production time varies depending on the product and customization
                  requirements.
                </li>
                <li>
                  Estimated manufacturing time may range from{" "}
                  <span className="text-on-surface font-medium">2&ndash;7 business days</span>,
                  excluding shipping time.
                </li>
                <li>Large or bulk orders may require additional production time.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                9. Shipping &amp; Delivery
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Orders are shipped through trusted courier partners. Delivery timelines are
                estimates only. GMK 3D CREATIONS shall not be responsible for delays caused by:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Courier companies</li>
                <li>Weather conditions</li>
                <li>Natural disasters</li>
                <li>Government restrictions</li>
                <li>Public holidays</li>
              </ul>
              <p className="text-on-surface-variant leading-relaxed">
                Risk of damage or loss transfers to the customer upon successful delivery.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                10. Cancellation
              </h2>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Orders may be cancelled only before production begins.</li>
                <li>
                  Customized and made-to-order products cannot be cancelled once manufacturing
                  has started.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                11. Returns &amp; Replacement
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Products may be eligible for replacement only if:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Wrong product delivered</li>
                <li>Product received damaged</li>
                <li>Manufacturing defect</li>
              </ul>
              <p className="text-on-surface-variant leading-relaxed">
                Customers must report such issues within{" "}
                <span className="text-on-surface font-medium">48 hours</span> of delivery with
                clear photos or videos. Customized products are not eligible for return unless
                damaged or incorrectly manufactured.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                12. Intellectual Property
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                All designs, logos, photographs, graphics, website content, product models,
                branding materials, and digital assets are the intellectual property of GMK 3D
                CREATIONS. Unauthorized copying, resale, reproduction, or commercial use is
                strictly prohibited.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                13. Limitation of Liability
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                GMK 3D CREATIONS shall not be liable for any indirect, incidental,
                consequential, or special damages arising from the use of our products or
                website. Our maximum liability shall not exceed the purchase amount of the
                product involved.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                14. Changes to Terms
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                We reserve the right to modify these Terms &amp; Conditions at any time. Updated
                versions will be published on this page with the revised Effective Date.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                15. Governing Law
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                These Terms shall be governed by the laws of India. Any disputes shall be
                subject to the jurisdiction of the courts in{" "}
                <span className="text-on-surface font-medium">Coimbatore, Tamil Nadu</span>.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">16. Contact</h2>
              <ul className="text-on-surface-variant leading-relaxed space-y-1">
                <li className="text-on-surface font-medium">GMK 3D CREATIONS</li>
                <li>Peelamedu, Coimbatore, Tamil Nadu</li>
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
                href="/privacy"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Privacy Policy &rarr;
              </Link>
              <Link
                href="/refund"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Refund &amp; Cancellation Policy &rarr;
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
