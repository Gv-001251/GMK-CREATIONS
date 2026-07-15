import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone, ArrowRight, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with GMK 3D Creations for custom 3D printing, prototypes, and design support.",
};

const contactMethods = [
  {
    label: "Email",
    value: "gmk3dcreations@gmail.com",
    href: "mailto:gmk3dcreations@gmail.com",
    icon: Mail,
  },
  {
    label: "Phone",
    value: "+91 93445 81320",
    href: "tel:+919344581320",
    icon: Phone,
  },
  {
    label: "Phone",
    value: "+91 99442 15100",
    href: "tel:+919944215100",
    icon: Phone,
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-on-surface">
      <Navbar />

      <section className="relative overflow-hidden px-4 sm:px-6 pt-28 pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent_45%)]" />

        <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
          <div className="rounded-[36px] border border-outline-variant/60 bg-background/80 backdrop-blur-sm shadow-2xl p-8 sm:p-10 lg:p-12">
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">
              Contact Us
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-on-surface max-w-2xl">
              Start a custom 3D print conversation with the team.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Share your idea, file, or deadline and we’ll help you choose the right material,
              finish, and print strategy for the job.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {contactMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <a
                    key={`${method.label}-${method.value}`}
                    href={method.href}
                    className="rounded-3xl border border-outline-variant/60 bg-surface-container/40 p-5 hover:border-primary/30 hover:bg-primary/[0.04] transition-all duration-200"
                  >
                    <Icon className="w-5 h-5 text-primary" />
                    <p className="mt-4 text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                      {method.label}
                    </p>
                    <p className="mt-2 text-sm font-medium text-on-surface break-words">
                      {method.value}
                    </p>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="rounded-[36px] border border-outline-variant/60 bg-surface-container-lowest shadow-2xl p-8 sm:p-10 lg:p-12">
            <div className="flex items-center gap-3 text-primary">
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs uppercase tracking-[0.3em] font-semibold">
                Fast Response
              </span>
            </div>
            <h2 className="mt-4 font-heading text-2xl sm:text-3xl font-bold text-on-surface">
              Best for custom quotes, order support, and production questions.
            </h2>

            <div className="mt-8 space-y-5 text-sm text-on-surface-variant leading-relaxed">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p>
                  31/12, Rajagopal Layout, Avarampalayam Road, Peelamedu, Coimbatore - 641 004.
                </p>
              </div>
              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p>gmk3dcreations@gmail.com</p>
              </div>
              <div className="flex gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p>(+91) 93445 81320 · (+91) 99442 15100</p>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="mailto:gmk3dcreations@gmail.com"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Email Us
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/upload"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-outline-variant/70 px-5 py-3 text-sm font-semibold text-on-surface hover:border-primary/30 hover:bg-primary/[0.04] transition-colors"
              >
                Upload a File
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
