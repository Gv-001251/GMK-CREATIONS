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
    <section className="relative bg-background min-h-screen flex items-center pt-28 pb-16 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 w-full">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* ── LEFT COLUMN: Bento Collage of cards (7 columns wide) ── */}
            <div className="lg:col-span-7 w-full order-2 lg:order-1">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="hidden md:grid gap-3"
                style={{
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gridTemplateRows: "repeat(4, 1fr)",
                  height: "520px",
                }}
              >
                {[
                  { card: bentoCards[0], col: "col-start-1 col-end-2", row: "row-start-1 row-end-2" }, // Figurines
                  { card: bentoCards[1], col: "col-start-1 col-end-2", row: "row-start-2 row-end-3" }, // Fashion
                  { card: bentoCards[5], col: "col-start-1 col-end-2", row: "row-start-3 row-end-4" }, // Custom
                  { card: bentoCards[2], col: "col-start-2 col-end-3", row: "row-start-1 row-end-3" }, // Home Decor
                  { card: bentoCards[6], col: "col-start-2 col-end-3", row: "row-start-3 row-end-5" }, // Accessories & More
                  { card: bentoCards[3], col: "col-start-3 col-end-4", row: "row-start-1 row-end-2" }, // Functional
                  { card: bentoCards[4], col: "col-start-3 col-end-4", row: "row-start-2 row-end-5" }, // Architectural
                ].map(({ card, col, row }) => (
                  <motion.div
                    key={card.id}
                    variants={itemVariants}
                    whileHover={{ y: -6, scale: 1.015 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className={`${col} ${row} relative rounded-[24px] overflow-hidden ${card.bg} group border border-white/5 shadow-md`}
                  >
                    <Link href={card.href} className="absolute inset-0 flex flex-col justify-between p-5 z-20">
                      <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 group-hover:bg-primary transition-colors flex items-center justify-center backdrop-blur-sm z-30">
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </div>

                      <div className="mt-auto">
                        <p className="font-heading text-sm font-bold leading-tight text-white whitespace-pre-line">
                          {card.title}
                        </p>
                      </div>
                    </Link>
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={card.image}
                        alt={card.title.replace("\n", " ")}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className={`${card.imgObject} transition-transform duration-500 group-hover:scale-105`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10" />
                    </div>
                  </motion.div>
                ))}

                {/* Col 1, Row 4 — Explore Products (ExploreCard) */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="col-start-1 col-end-2 row-start-4 row-end-5 relative rounded-[24px] overflow-hidden bg-[#1c1c1e] border border-white/5 shadow-md group"
                >
                  <Link
                    href="/products"
                    className="absolute inset-0 flex items-center justify-center z-20"
                    id="bento-explore-all"
                  >
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                      <span className="text-white font-bold text-[11px] uppercase tracking-wider">Explore Products</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
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

            {/* ── RIGHT COLUMN: Hero lines (5 columns wide) ── */}
            <div className="lg:col-span-5 w-full flex flex-col items-start text-left order-1 lg:order-2">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-xs font-extrabold text-white bg-primary border border-primary/20 px-3.5 py-1.5 rounded-full w-max block mb-4 uppercase tracking-widest shadow-md"
              >
                Custom 3D Printing
              </motion.span>

              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="font-heading text-4xl sm:text-5xl md:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6 text-slate-950 dark:text-white"
              >
                Custom 3D Prints,<br />
                <span className="text-primary relative inline-block">
                  Made for You
                </span>
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-body leading-relaxed mb-8"
              >
                Transform your ideas into reality with precision engineered 3D printing solutions for creators, businesses and innovators.
              </motion.p>
            </div>

          </div>
      </div>
    </section>
  );
}
