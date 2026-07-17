import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How GMK 3D Creations collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "July 17, 2026";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-on-surface-variant">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="mt-10 space-y-10">
            <section className="space-y-3">
              <p className="text-on-surface-variant leading-relaxed">
                GMK 3D CREATIONS values your privacy and is committed to protecting your
                personal information. This Privacy Policy explains how we collect, use, store,
                and protect your information when you visit our website or make a purchase.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                1. Information We Collect
              </h2>

              <h3 className="font-heading text-base font-semibold text-on-surface">
                Personal Information
              </h3>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-1">
                <li>Name</li>
                <li>Email Address</li>
                <li>Mobile Number</li>
                <li>Billing Address</li>
                <li>Shipping Address</li>
              </ul>

              <h3 className="font-heading text-base font-semibold text-on-surface">
                Order Information
              </h3>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-1">
                <li>Purchased products</li>
                <li>Order history</li>
                <li>Payment status</li>
                <li>Invoice details</li>
              </ul>

              <h3 className="font-heading text-base font-semibold text-on-surface">
                Technical Information
              </h3>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-1">
                <li>IP Address</li>
                <li>Browser Information</li>
                <li>Device Information</li>
                <li>Cookies</li>
                <li>Website Usage Data</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                2. Why We Collect Your Information
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                We use your information to:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Process your orders</li>
                <li>Deliver purchased products</li>
                <li>Provide customer support</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Improve our products and services</li>
                <li>Prevent fraud</li>
                <li>Comply with legal requirements</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                3. Payment Security
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Payments are securely processed through Razorpay and other authorized payment
                gateways. GMK 3D CREATIONS does{" "}
                <span className="text-on-surface font-medium">not</span> collect or store:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-1">
                <li>Credit Card Numbers</li>
                <li>Debit Card Numbers</li>
                <li>CVV</li>
                <li>UPI PIN</li>
                <li>Internet Banking Credentials</li>
              </ul>
              <p className="text-on-surface-variant leading-relaxed">
                All payment information is securely handled by certified payment service
                providers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">4. Cookies</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Our website uses cookies to:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Improve browsing experience</li>
                <li>Maintain shopping cart sessions</li>
                <li>Remember user preferences</li>
                <li>Analyze website traffic</li>
              </ul>
              <p className="text-on-surface-variant leading-relaxed">
                Users may disable cookies through browser settings, though certain website
                features may not function properly.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                5. Sharing of Information
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                We never sell your personal information. Information may be shared only with:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Payment Gateway Providers</li>
                <li>Courier &amp; Logistics Partners</li>
                <li>Technology Service Providers</li>
                <li>Government Authorities where legally required</li>
              </ul>
              <p className="text-on-surface-variant leading-relaxed">
                These entities receive only the information necessary to provide their
                services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                6. Data Security
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                We implement reasonable technical and organizational safeguards to protect your
                personal information against unauthorized access, disclosure, alteration, or
                destruction. While we strive to maintain secure systems, no method of
                electronic transmission or storage is completely secure.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                7. Data Retention
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Your information is retained only for as long as necessary to:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Complete your orders</li>
                <li>Meet legal and tax obligations</li>
                <li>Resolve disputes</li>
                <li>Maintain business records</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">8. Your Rights</h2>
              <p className="text-on-surface-variant leading-relaxed">
                You may contact us to:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion where legally permitted</li>
                <li>Withdraw consent for promotional communications</li>
                <li>Raise privacy-related concerns</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                9. Third-Party Links
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Our website may contain links to third-party websites. GMK 3D CREATIONS is not
                responsible for the privacy practices or content of external websites.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                10. Children&apos;s Privacy
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Our website is not intended for individuals under 18 years of age. We do not
                knowingly collect personal information from minors.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                11. Policy Updates
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                This Privacy Policy may be updated from time to time. The revised version will
                be posted on this page with the updated Effective Date.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">12. Contact Us</h2>
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
