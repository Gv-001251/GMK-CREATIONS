"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background pt-20">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          {/* Left Content */}
          <div className="max-w-xl lg:max-w-lg xl:max-w-xl flex-shrink-0">
            {/* Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] xl:text-[4.8rem] font-bold leading-[1.05] tracking-tight mb-6 text-on-surface">
              Custom <em className="text-primary not-italic font-bold italic">3D Prints</em>,<br />
              Made for You
            </h1>

            {/* Subtext */}
            <p className="text-base md:text-lg text-on-surface-variant font-body leading-relaxed max-w-md mb-8">
              Transform your ideas into reality with fully customizable 3D printing solutions. From prototypes and personalized gifts to architectural models and custom creations, we print exactly what you imagine.
            </p>

            {/* Feature Highlights */}
            <div className="flex flex-wrap gap-2.5 mb-10 max-w-md">
              {[
                "Custom Design Uploads",
                "Personalized Products",
                "Rapid Prototyping",
                "High Precision Printing",
                "Multiple Material Options",
                "Fast Delivery",
              ].map((feature) => (
                <div
                  key={feature}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/[0.06] text-primary border border-primary/10 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/upload"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full gradient-primary text-white text-sm font-semibold tracking-wide hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                id="hero-cta-customize"
              >
                Start Customizing
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-surface-container-high text-on-surface text-sm font-medium hover:bg-surface-container-highest transition-all duration-300 border border-outline-variant"
                id="hero-cta-quote"
              >
                Request a Quote
              </Link>
            </div>

            {/* Trust-building Line */}
            <p className="text-xs text-on-surface-variant/80 font-medium mt-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-pulse" />
              Upload your design, customize every detail, and receive a professionally crafted 3D print.
            </p>
          </div>

          {/* Right: 3D Sculpture in Dark Circle */}
          <div className="relative flex-shrink-0">
            {/* Dark circle background */}
            <div className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[420px] md:h-[420px] lg:w-[480px] lg:h-[480px] xl:w-[540px] xl:h-[540px] rounded-full bg-[#1a1d2e] overflow-hidden flex items-center justify-center relative shadow-2xl">
              <Image
                src="/images/Home IMG.jpg"
                alt="3D printer printing a custom creation"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority
              />
            </div>
            {/* Subtle glow behind the circle */}
            <div className="absolute -inset-8 rounded-full bg-[#1a1d2e]/10 blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
