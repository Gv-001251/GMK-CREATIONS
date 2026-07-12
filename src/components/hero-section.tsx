"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Grid3X3 } from "lucide-react";
import { motion } from "framer-motion";

const bentoCards = [
  // Col 1 Row 1 — Figurine
  {
    id: "figurines",
    title: "Figurines &\nCollectibles",
    image: "/images/3D%20Fig.jpg",
    href: "/products?category=miniatures",
    bg: "bg-[#1c1c1e]",
    textColor: "text-white",
    imgObject: "object-cover",
    col: "col-start-1 col-end-2",
    row: "row-start-1 row-end-2",
  },
  // Col 1 Row 2 — Accessories
  {
    id: "fashion",
    title: "Fashion &\nAccessories",
    image: "/images/3D%20Jewels.jpeg",
    href: "/products?category=edc-gear",
    bg: "bg-[#1c1c1e]",
    textColor: "text-white",
    imgObject: "object-cover",
    col: "col-start-1 col-end-2",
    row: "row-start-2 row-end-3",
  },
  // Col 2 Rows 1+2 — Home Decor
  {
    id: "home-decor",
    title: "Home Decor &\nLifestyle",
    image: "/images/3D%20Flowers.webp",
    href: "/products?category=decor",
    bg: "bg-[#1c1c1e]",
    textColor: "text-white",
    imgObject: "object-cover",
    col: "col-start-2 col-end-3",
    row: "row-start-1 row-end-3",
  },
  // Col 3 Row 1 — Functional Parts
  {
    id: "functional",
    title: "Functional\nParts",
    image: "/images/3D%20Func%20Parts.jpg",
    href: "/products?category=prototypes",
    bg: "bg-[#1c1c1e]",
    textColor: "text-white",
    imgObject: "object-cover",
    col: "col-start-3 col-end-4",
    row: "row-start-1 row-end-2",
  },
  // Col 4 Rows 1+2 — Architectural Models
  {
    id: "architectural",
    title: "Architectural\nModels",
    image: "/images/products/architectural-models.png",
    href: "/products?category=architecture",
    bg: "bg-[#1c1c1e]",
    textColor: "text-white",
    imgObject: "object-cover",
    col: "col-start-4 col-end-5",
    row: "row-start-1 row-end-3",
  },
  // Col 5 Row 1 — Custom Prints
  {
    id: "custom",
    title: "Custom 3D\nPrints",
    image: "/images/products/organic-sculptures.png",
    href: "/upload",
    bg: "bg-[#1c1c1e]",
    textColor: "text-white",
    imgObject: "object-cover",
    col: "col-start-5 col-end-6",
    row: "row-start-1 row-end-2",
  },
  // Col 5 Row 2 — Accessories & More
  {
    id: "accessories",
    title: "Accessories &\nMore",
    image: "/images/products/custom_keychain.png",
    href: "/products",
    bg: "bg-[#1c1c1e]",
    textColor: "text-white",
    imgObject: "object-cover",
    col: "col-start-5 col-end-6",
    row: "row-start-2 row-end-3",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export function HeroSection() {
  return (
    <section className="relative bg-background pt-32 pb-16 overflow-hidden">
      {/* SVG Clip Path Definition for the custom tab bend corner */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id="hero-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0,1 
                     L 0,0.03 
                     Q 0,0 0.02,0 
                     L 0.08,0 
                     Q 0.10,0 0.11,0.015
                     Q 0.12,0.03 0.14,0.03
                     L 0.98,0.03 
                     Q 1,0.03 1,0.06
                     L 1,0.97 
                     Q 1,1 0.98,1
                     L 0.02,1 
                     Q 0,1 0,0.97 
                     Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div 
          className="relative overflow-hidden bg-cover bg-center p-8 md:p-14 shadow-2xl"
          style={{ 
            backgroundImage: "url('/images/Home%20bg.jpeg')",
            clipPath: "url(#hero-clip)"
          }}
        >
          {/* Ambient overlay */}
          <div className="absolute inset-0 bg-slate-950/70 z-0 pointer-events-none" />

          <div className="relative z-10">
            {/* ── Top Row: Badge | Headline | Customer Count ── */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 mb-16">
              
              {/* Left: Circular Stamp Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex-shrink-0 hidden lg:flex items-center justify-center w-36 h-36 xl:w-40 xl:h-40"
              >
                <div className="relative w-full h-full">
                  <svg viewBox="0 0 160 160" className="w-full h-full animate-[spin_20s_linear_infinite]">
                    <defs>
                      <path
                        id="circle-text-path"
                        d="M 80,80 m -58,0 a 58,58 0 1,1 116,0 a 58,58 0 1,1 -116,0"
                      />
                    </defs>
                    <text className="fill-white text-[10px] font-bold tracking-[0.25em] uppercase font-heading">
                      <textPath href="#circle-text-path" startOffset="0%">
                        IMAGINE · DESIGN · PRINT · MADE IN 3D ·
                      </textPath>
                    </text>
                    <circle cx="80" cy="80" r="58" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/10" />
                  </svg>
                  {/* Center cube icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center bg-white/5 shadow-sm text-white">
                      <svg viewBox="0 0 24 24" className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Center: Headline + Subtitle */}
              <div className="flex-1 text-center max-w-3xl mx-auto">
                <motion.h1 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="font-heading text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6 text-white"
                >
                  Custom 3D Prints,<br />
                  <span className="text-primary relative inline-block">
                    Made for You
                    <span className="absolute bottom-1 left-0 w-full h-[6px] bg-primary/20 rounded-full" />
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  className="text-base sm:text-lg text-slate-300 font-body leading-relaxed max-w-2xl mx-auto px-4"
                >
                  Transform your ideas into reality with precision engineered 3D printing solutions for creators, businesses and innovators.
                </motion.p>
              </div>

              {/* Right: Customer count */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-shrink-0 hidden lg:flex flex-col items-center gap-2"
              >
                {/* Overlapping avatars */}
                <div className="flex items-center">
                  {[
                    { img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80" },
                    { img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&q=80" },
                    { img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&q=80" },
                  ].map((a, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-900 shadow-sm relative"
                      style={{ marginLeft: i > 0 ? "-10px" : 0, zIndex: 3 - i }}
                    >
                      <img src={a.img} alt={`User ${i}`} className="object-cover w-full h-full" />
                    </div>
                  ))}
                  <div
                    className="w-9 h-9 rounded-full bg-primary text-white text-[10px] font-bold border-2 border-slate-900 flex items-center justify-center shadow-sm animate-pulse"
                    style={{ marginLeft: "-10px", zIndex: 0 }}
                  >
                    99%
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    1000+ Clients
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Rating ★ 4.9/5.0
                  </span>
                </div>
              </motion.div>
            </div>

            {/* ── Bento Grid ── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="hidden md:grid gap-4"
              style={{
                gridTemplateColumns: "repeat(5, 1fr)",
                gridTemplateRows: "200px 200px",
              }}
            >
              {bentoCards.map((card) => (
                <motion.div
                  key={card.id}
                  variants={itemVariants}
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={`${card.col} ${card.row} relative rounded-[24px] overflow-hidden ${card.bg} group border border-white/5 shadow-md`}
                >
                  <Link href={card.href} className="absolute inset-0 flex flex-col justify-between p-5 z-20">
                    {/* Always-visible arrow top right */}
                    <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 group-hover:bg-primary transition-colors flex items-center justify-center backdrop-blur-sm z-30">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </div>

                    <div className="mt-auto">
                      <p className="font-heading text-base font-bold leading-tight text-white whitespace-pre-line">
                        {card.title}
                      </p>
                    </div>
                  </Link>
                  {/* Image */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={card.image}
                      alt={card.title.replace("\n", " ")}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className={`${card.imgObject} transition-transform duration-500 group-hover:scale-105`}
                    />
                    {/* Ambient dark bottom gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10" />
                  </div>
                </motion.div>
              ))}

              {/* Col 3, Row 2 — Explore All Products */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="col-start-3 col-end-4 row-start-2 row-end-3 relative rounded-[24px] overflow-hidden bg-[#1c1c1e] border border-white/5 shadow-md group"
              >
                <Link
                  href="/products"
                  className="absolute inset-0 flex items-center justify-center z-20"
                  id="bento-explore-all"
                >
                  {/* Content Container */}
                  <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <Grid3X3 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white font-semibold text-xs">Explore Products</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src="/images/Explore%20prd.jpeg"
                    alt="Explore Products Background"
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/75 z-10" />
                </div>
              </motion.div>
            </motion.div>

            {/* Mobile: fallback simple 2-col grid */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:hidden grid grid-cols-2 gap-3 mt-4"
            >
              {bentoCards.slice(0, 6).map((card) => (
                <Link
                  key={card.id}
                  href={card.href}
                  className={`group relative rounded-[20px] overflow-hidden ${card.bg} h-40 border border-white/5 shadow-md`}
                >
                  <Image
                    src={card.image}
                    alt={card.title.replace("\n", " ")}
                    fill
                    sizes="50vw"
                    className={`${card.imgObject}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                  <div className="absolute bottom-0 left-0 right-0 p-3.5 z-20">
                    <p className="font-heading text-xs font-bold text-white whitespace-pre-line leading-tight">
                      {card.title}
                    </p>
                  </div>
                </Link>
              ))}
              <Link
                href="/products"
                className="col-span-2 rounded-[20px] bg-primary flex items-center justify-center gap-3 py-4 mt-1"
                id="bento-explore-mobile"
              >
                <Grid3X3 className="w-4 h-4 text-white" />
                <span className="text-white font-semibold text-xs">Explore All Products</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
