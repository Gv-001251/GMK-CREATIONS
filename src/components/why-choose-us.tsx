"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function WhyChooseUs() {
  const metrics = [
    { value: "100+", label: "Custom Orders" },
    { value: "48 Hours", label: "Average Turnaround" },
    { value: "95%", label: "Client Satisfaction" },
    { value: "Premium", label: "Print Quality" },
  ];

  const cards = [
    {
      title: "Customizable Designs",
      subtitle: "Personalize every detail, dimension, and setting to bring your specific vision to life.",
      icon: "/icons/customisation.svg",
      alt: "Customizable Designs Icon"
    },
    {
      title: "Precision Printing",
      subtitle: "High-resolution layers and meticulous calibration for industrial-grade accuracy.",
      icon: "/icons/precision.svg",
      alt: "Precision Printing Icon"
    },
    {
      title: "Custom Orders",
      subtitle: "Flexible print options supporting both one-off personalized gifts and bulk corporate orders.",
      icon: "/icons/custom-orders.svg",
      alt: "Custom Orders Icon"
    },
    {
      title: "Fast Delivery",
      subtitle: "Rapid manufacturing turnarounds with secure express shipping across India.",
      icon: "/icons/delivery.svg",
      alt: "Fast Delivery Icon"
    }
  ];

  return (
    <section className="relative py-24 px-4 sm:px-6 overflow-hidden border-t border-outline-variant" id="why-choose-us">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 xl:gap-16 items-start">
          {/* Left Column: Content Refinement & Metrics */}
          <div className="lg:col-span-6 space-y-10 animate-slide-up">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest bg-primary/[0.08] text-primary uppercase w-fit">
                ABOUT GMK
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-on-surface leading-[1.15]">
                Transforming Ideas Into <br />
                <span className="text-primary font-bold">Custom</span> 3D Reality
              </h2>
              <p className="text-base sm:text-lg text-on-surface-variant font-body leading-relaxed max-w-2xl">
                GMK 3D Creations transforms ideas into <span className="text-primary font-bold">precision</span>-crafted 3D products. From personalized gifts and prototypes to architectural models and custom creations, we bring your imagination to life with professional-grade <span className="text-primary font-bold">3D printing</span> and <span className="text-primary font-bold">innovation</span>.
              </p>
            </div>

            {/* Trust Metrics Section */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-0 pt-8 border-t border-outline-variant/35">
              {metrics.map((metric, i) => {
                const paddingClass =
                  i === 0 ? "pr-4 pl-0 sm:pr-6" :
                    i === 1 ? "pl-4 pr-0 sm:px-6" :
                      i === 2 ? "pr-4 pl-0 sm:px-6" :
                        "pl-4 pr-0 sm:pl-6 sm:pr-0";

                const borderClass =
                  i === 0 ? "border-r border-outline-variant/30" :
                    i === 1 ? "border-r-0 sm:border-r border-outline-variant/30" :
                      i === 2 ? "border-r border-outline-variant/30" :
                        "border-r-0";

                return (
                  <div key={i} className={`flex flex-col gap-1 ${paddingClass} ${borderClass}`}>
                    <span className="font-heading text-2xl sm:text-3xl font-extrabold text-primary tracking-tight whitespace-nowrap">
                      {metric.value}
                    </span>
                    <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
                      {metric.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mx-auto lg:pt-0">
            {cards.map((card, index) => {
              return (
                <div
                  key={index}
                  className="p-8 rounded-[24px] bg-white/90 dark:bg-surface-container-low/90 backdrop-blur-md border border-outline-variant hover:border-primary/40 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-ambient-lg transition-all duration-300 flex flex-col justify-between group h-full"
                >
                  <div>
                    {/* Blue Tinted Icon Container */}
                    <div className="w-14 h-14 rounded-full bg-primary/[0.06] border border-primary/10 flex items-center justify-center mb-6 group-hover:scale-[1.08] transition-transform duration-300 shadow-sm text-primary">
                      <Image
                        src={card.icon}
                        alt={card.alt}
                        width={48}
                        height={48}
                        className="w-11 h-11 object-contain"
                        priority
                      />
                    </div>
                    {/* Content */}
                    <h3 className="font-heading text-lg font-bold text-on-surface mb-2 tracking-tight group-hover:text-primary transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div
          className="relative mt-20 max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/10 bg-cover bg-center text-white py-16 px-8 sm:px-16 text-center"
          style={{ backgroundImage: "url('/images/Let's%20connect.jpeg')" }}
        >
          {/* Overlay for legibility */}
          <div className="absolute inset-0 bg-slate-900/45" />

          <div className="relative z-10 space-y-7">
            <p className="text-base sm:text-lg md:text-xl text-white/95 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              Looking for custom materials, metallic finishes, or unique textures? Let us transform your ideas into professionally crafted 3D printed products.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-primary text-sm sm:text-base font-semibold hover:bg-surface-container-high transition-all duration-300 shadow-md"
                id="about-cta-explore"
              >
                Explore Our Products
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 text-white text-sm sm:text-base font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 backdrop-blur-sm shadow-sm"
                id="about-cta-quote"
              >
                Request a Custom Design
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
