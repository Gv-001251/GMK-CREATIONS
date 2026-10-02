"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Upload, 
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroSlide {
  id: string;
  categoryName: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  badge: string;
  specs: {
    resolution: string;
    material: string;
    tolerance: string;
  };
  glowColor: string;
}

const slides: HeroSlide[] = [
  {
    id: "figurines",
    categoryName: "Figurines",
    title: "Figurines & Collectibles",
    subtitle: "Transform your ideas into reality with precision engineered 3D printing solutions for creators, businesses and innovators.",
    image: "/images/3D Fig.jpg",
    href: "/products?category=miniatures",
    badge: "Ultra-Fine Resin",
    specs: {
      resolution: "0.05mm Layers",
      material: "High-Detail Tough Resin",
      tolerance: "±0.05 mm Precision",
    },
    glowColor: "rgba(56, 189, 248, 0.25)",
  },
  {
    id: "architecture",
    categoryName: "Architecture",
    title: "Architectural Scale Models",
    subtitle: "Breathtaking scale replicas, intricate monuments, and structural prototypes engineered for presentations, architects, and exhibitions.",
    image: "/images/Architectural design.jpg",
    href: "/products?category=architecture",
    badge: "Presentation Grade",
    specs: {
      resolution: "0.08mm Layers",
      material: "Architectural SLA Resin",
      tolerance: "Scale True 1:100",
    },
    glowColor: "rgba(245, 158, 11, 0.22)",
  },
  {
    id: "functional",
    categoryName: "Functional Parts",
    title: "Functional Prototypes & Engineering",
    subtitle: "Industrial-grade mechanical assemblies, snap-fit enclosures, and high-tensile gears built for rigorous testing and rapid manufacturing.",
    image: "/images/3D Func Parts.jpg",
    href: "/products?category=prototypes",
    badge: "Industrial Strength",
    specs: {
      resolution: "0.12mm Layers",
      material: "Carbon Fiber PLA & PETG",
      tolerance: "±0.1 mm Fit",
    },
    glowColor: "rgba(16, 185, 129, 0.22)",
  },
  {
    id: "decor",
    categoryName: "Home Decor",
    title: "Home Decor & Sculptures",
    subtitle: "Artistic parametric vases, geometric planters, and statement ambient lighting crafted with digital craftsmanship for modern spaces.",
    image: "/images/3D Flowers.webp",
    href: "/products?category=decor",
    badge: "Parametric Living",
    specs: {
      resolution: "0.15mm Layers",
      material: "Matte Eco PLA+",
      tolerance: "Watertight Finish",
    },
    glowColor: "rgba(217, 70, 239, 0.22)",
  },
  {
    id: "custom",
    categoryName: "Custom Prints",
    title: "Custom 3D Printing On Demand",
    subtitle: "Got a 3D model or design concept? Upload your STL, OBJ, or STEP file for automated slicing, instant pricing, and priority dispatch.",
    image: "/images/home-img.jpg",
    href: "/upload",
    badge: "Instant Slicing",
    specs: {
      resolution: "0.05 - 0.2mm Custom",
      material: "SLA / FDM / Carbon",
      tolerance: "24-Hour Dispatch",
    },
    glowColor: "rgba(99, 102, 241, 0.25)",
  },
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 = next, -1 = prev
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const currentSlide = slides[currentIndex];

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Auto advance every 6.5 seconds when not paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused, handleNext]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <section 
      className="relative w-full h-screen min-h-[700px] max-h-[1100px] flex flex-col justify-between overflow-hidden bg-[#09090b] text-white select-none pt-24 pb-8 sm:pb-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── FULL-VIEWPORT COVER BACKGROUND IMAGE CAROUSEL ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence custom={direction} mode="sync">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={currentSlide.image}
              alt={currentSlide.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Top shadow gradient for navbar readability */}
        <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-black/90 via-black/45 to-transparent pointer-events-none" />

        {/* Ambient color wash */}
        <div 
          className="absolute inset-0 transition-colors duration-1000 pointer-events-none opacity-30 mix-blend-color"
          style={{ background: currentSlide.glowColor }}
        />

        {/* Global contrast darkening + radial vignette */}
        <div className="absolute inset-0 bg-black/45 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />

        {/* Bottom shadow gradient for text readability and smooth blend into section 2 */}
        <div className="absolute bottom-0 inset-x-0 h-96 sm:h-120 bg-gradient-to-t from-[#09090b] via-[#09090b]/85 to-transparent pointer-events-none" />

        {/* Subtle high-tech CAD grid overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 80%)",
          }}
        />
      </div>

      {/* ── CAROUSEL ARROWS (< and >) ── */}
      {/* Left Chevron */}
      <button
        onClick={handlePrev}
        aria-label="Previous Creation"
        className="absolute left-4 sm:left-8 md:left-12 lg:left-16 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 hover:bg-white/20 active:scale-95 border border-white/20 hover:border-white/50 backdrop-blur-xl flex items-center justify-center text-white/80 hover:text-white transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.6)] group cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2] transition-transform duration-300 group-hover:-translate-x-1" />
      </button>

      {/* Right Chevron */}
      <button
        onClick={handleNext}
        aria-label="Next Creation"
        className="absolute right-4 sm:right-8 md:right-12 lg:right-16 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 hover:bg-white/20 active:scale-95 border border-white/20 hover:border-white/50 backdrop-blur-xl flex items-center justify-center text-white/80 hover:text-white transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.6)] group cursor-pointer"
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2] transition-transform duration-300 group-hover:translate-x-1" />
      </button>

      {/* ── MAIN CONTENT (TITLE & SUBTITLE FROM WIREFRAME) ── */}
      <div className="relative z-20 flex-1 flex flex-col justify-end items-center max-w-5xl mx-auto px-6 text-center pb-6 sm:pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id + "-content"}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Floating Specs Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-xs font-mono text-zinc-200 shadow-xl mb-4 sm:mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-white">{currentSlide.badge}</span>
              <span className="text-white/40">•</span>
              <span className="text-zinc-300">{currentSlide.specs.resolution}</span>
              <span className="hidden sm:inline text-white/40">•</span>
              <span className="hidden sm:inline text-zinc-300">{currentSlide.specs.tolerance}</span>
            </div>

            {/* Wireframe Heading */}
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] max-w-4xl leading-tight">
              {currentSlide.title}
            </h1>

            {/* Wireframe Subtitle */}
            <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-zinc-200/90 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-[0_2px_15px_rgba(0,0,0,0.95)]">
              {currentSlide.subtitle}
            </p>

            {/* Action CTA Buttons */}
            <div className="mt-7 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href={currentSlide.href}
                className="inline-flex items-center gap-2 px-8 py-3 sm:py-3.5 rounded-full bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.35)] hover:scale-103"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-7 py-3 sm:py-3.5 rounded-full bg-black/40 hover:bg-white/15 text-white text-sm font-medium border border-white/25 hover:border-white/50 backdrop-blur-xl transition-all duration-300 shadow-lg"
              >
                <Upload className="w-4 h-4 text-zinc-300" />
                <span>Upload 3D File</span>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── BOTTOM CAROUSEL SELECTOR & CONTROLS ── */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 w-full pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/15 pt-4">
          
          {/* Category Pill Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(idx)}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-white text-zinc-950 font-semibold shadow-lg scale-105"
                      : "bg-black/40 text-zinc-300 hover:text-white hover:bg-white/15 border border-white/15 backdrop-blur-md"
                  }`}
                >
                  {slide.categoryName}
                </button>
              );
            })}
          </div>

          {/* Slide Progress Counter */}
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-300">
            <span className="text-white font-bold">
              0{currentIndex + 1}
            </span>
            <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span>0{slides.length}</span>
          </div>

        </div>
      </div>
    </section>
  );
}
