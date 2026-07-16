import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How GMK 3D Creations collects, uses, and protects your personal information and uploaded files.",
};

const LAST_UPDATED = "July 16, 2026";

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
                This Privacy Policy explains how GMK 3D Creations (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
                collects, uses, and protects your information when you use our website and place
                orders. By using the website, you agree to the practices described here.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                1. Information We Collect
              </h2>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>
                  <span className="text-on-surface font-medium">Account &amp; contact details:</span>{" "}
                  your name, email address, and password when you create an account.
                </li>
                <li>
                  <span className="text-on-surface font-medium">Order &amp; shipping details:</span>{" "}
                  the name, address, phone number, and email you provide at checkout.
                </li>
                <li>
                  <span className="text-on-surface font-medium">Uploaded files:</span> the 3D
                  model files you upload for custom prints, along with the print options you
                  select (material, scale, infill, quantity).
                </li>
                <li>
                  <span className="text-on-surface font-medium">Payment information:</span>{" "}
                  handled directly by our payment partner, Razorpay. We receive confirmation of
                  payment but do not collect or store your card, UPI, or bank details.
                </li>
                <li>
                  <span className="text-on-surface font-medium">Usage information:</span> basic
                  technical data such as device and browser details needed to operate the site
                  securely.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                2. How We Use Your Information
              </h2>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>To process, produce, and deliver your orders.</li>
                <li>To send order confirmations and status updates by email.</li>
                <li>To provide customer support and respond to your enquiries.</li>
                <li>To operate, secure, and improve our website and services.</li>
                <li>To meet legal, tax, and accounting obligations.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                3. Payment Processing
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Online payments are processed by Razorpay, which is certified to industry
                security standards. Your payment details are entered on Razorpay&apos;s secure
                systems and are never stored by us. Your use of Razorpay is also subject to
                their own privacy policy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                4. Your Uploaded Files
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Files you upload are stored securely and used only to prepare and produce your
                order. We do not sell, share, or reproduce your designs for any purpose other
                than fulfilling your order. Files associated with completed orders may be
                retained for a reasonable period for support and reprint purposes, and are
                removed when no longer required.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                5. How We Share Information
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                We do not sell your personal information. We share it only with trusted service
                providers who help us run the business, and only to the extent needed, such as:
              </p>
              <ul className="list-disc pl-5 text-on-surface-variant leading-relaxed space-y-2">
                <li>Razorpay — to process payments and refunds.</li>
                <li>Shipping and courier partners — to deliver your order.</li>
                <li>Email service providers — to send order-related notifications.</li>
                <li>
                  Authorities — where required by law or to protect our legal rights.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                6. Data Retention
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                We keep your information for as long as needed to fulfil orders, provide
                support, and comply with legal and accounting requirements. When information is
                no longer needed, we take reasonable steps to delete or anonymise it.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                7. Data Security
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                We use reasonable technical and organisational measures to protect your
                information. However, no method of transmission or storage is completely
                secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">8. Your Rights</h2>
              <p className="text-on-surface-variant leading-relaxed">
                You may request access to, correction of, or deletion of your personal
                information, and you can ask us to stop sending marketing emails at any time. To
                make a request, contact us using the details below. Note that we may need to
                retain certain information to meet legal obligations.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                9. Children&apos;s Privacy
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Our website is not directed at children under 13, and we do not knowingly
                collect their personal information. If you believe a child has provided us
                information, please contact us and we will delete it.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">
                10. Changes to This Policy
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date
                above reflects the most recent revision. Please review this page periodically.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-on-surface">11. Contact Us</h2>
              <p className="text-on-surface-variant leading-relaxed">
                If you have questions about this Privacy Policy or your data, contact us:
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
                href="/terms"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Read our Terms &amp; Conditions →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
