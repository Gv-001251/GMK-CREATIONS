"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background pt-20">
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          {/* Left Content */}
          <div className="max-w-xl lg:max-w-lg xl:max-w-xl flex-shrink-0">
            {/* Headline */}
            <h1 className="font-heading text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5rem] font-bold leading-[1.05] tracking-tight mb-6 text-on-surface">
              Turning{" "}
              <em className="text-primary not-italic font-bold italic">Ideas</em>{" "}
              Into Reality
            </h1>

            {/* Subtext */}
            <p className="text-base md:text-lg text-on-surface-variant font-body leading-relaxed max-w-md mb-10">
              Precision materiality for your digital concepts. Custom
              prototypes, miniatures, and intricate art.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full gradient-primary text-white text-sm font-semibold tracking-wide hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                id="hero-cta-explore"
              >
                Explore Products
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-surface-container-high text-on-surface text-sm font-medium hover:bg-surface-container-highest transition-all duration-300 border border-outline-variant"
                id="hero-cta-quote"
              >
                Request Quote
              </Link>
            </div>
          </div>

          {/* Right: 3D Sculpture in Dark Circle */}
          <div className="relative flex-shrink-0">
            {/* Dark circle background */}
            <div className="w-[340px] h-[340px] md:w-[420px] md:h-[420px] lg:w-[480px] lg:h-[480px] xl:w-[540px] xl:h-[540px] rounded-full bg-[#1a1d2e] overflow-hidden flex items-center justify-center relative shadow-2xl">
              <Image
                src="/images/hero-sculpture.png"
                alt="3D printed abstract sculpture"
                fill
                className="object-cover scale-90"
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
