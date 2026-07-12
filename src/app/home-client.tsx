"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Upload, 
  Shield, 
  Clock, 
  Coins, 
  Award, 
  Sparkles, 
  Star, 
  Printer, 
  Heart, 
  ChevronRight, 
  FileText, 
  CheckCircle, 
  Boxes 
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { Footer } from "@/components/footer";

// Statistics Auto Countup helper
function AnimatedNumber({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const totalMiliseconds = duration * 1000;
      const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 15);
      
      const timer = setInterval(() => {
        start += Math.ceil(end / (totalMiliseconds / incrementTime));
        if (start >= end) {
          clearInterval(timer);
          setCount(end);
        } else {
          setCount(start);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
}

const reviewAvatars = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
];

const reviews = [
  {
    quote: "The quality and detail of the print was beyond my expectations. Highly recommended!",
    name: "Sriman Kalyan",
    role: "Engineer",
    company: "AeroTech Solutions",
    stars: 5,
  },
  {
    quote: "Amazing service! They printed my custom design perfectly and delivered on time.",
    name: "Nikhil Krishnan",
    role: "Lead Designer",
    company: "CreativeHub",
    stars: 5,
  },
  {
    quote: "Great communication and fantastic results. Will definitely order again!",
    name: "Kumar Swamy",
    role: "Product Manager",
    company: "Velo Robotics",
    stars: 5,
  },
  {
    quote: "Superb finishing on the Taj Mahal model. Extremely satisfied with the print resolution.",
    name: "Venkatesh Prasad",
    role: "Consultant",
    company: "ArchStudio",
    stars: 5,
  },
  {
    quote: "The gears fit perfectly into my prototype assembly. Good material strength, minor post-processing needed.",
    name: "Balaji Rao",
    role: "Hardware Developer",
    company: "HexaGear",
    stars: 4,
  },
  {
    quote: "Ordered custom keychains for my team. The dual-color text looks incredibly neat and sharp.",
    name: "Raghavan S.",
    role: "HR Manager",
    company: "TechnoCorp",
    stars: 5,
  },
  {
    quote: "Very fast turnaround. My STL file was sliced and printed within 24 hours.",
    name: "Murali Dharan",
    role: "Maker",
    company: "Self Employed",
    stars: 5,
  },
  {
    quote: "The geometric planter looks amazing on my desk. Excellent layer adhesion.",
    name: "Anand Ramaswamy",
    role: "Architect",
    company: "PlanDeco",
    stars: 5,
  },
  {
    quote: "Good quality miniatures for our tabletop game. Some support structures were slightly hard to remove.",
    name: "Suresh Babu",
    role: "Hobbyist",
    company: "GamingHQ",
    stars: 4,
  },
  {
    quote: "Fantastic detail on the space marine bust! Perfect gift for collectibles lovers.",
    name: "Karthik Raja",
    role: "Collector",
    company: "ToyStore",
    stars: 5,
  },
];

const featuredProducts = [
  {
    name: "Dragon Bust",
    category: "Figurines",
    desc: "Articulated dragon head sculpture with fine scale definition.",
    price: 1200,
    rating: 4.9,
    image: "/images/products/space_marine_bust.png"
  },
  {
    name: "Geometric Planter",
    category: "Home Decor",
    desc: "Sleek multifaceted container for indoor succulents.",
    price: 450,
    rating: 4.8,
    image: "/images/3D%20Flowers.webp"
  },
  {
    name: "Mechanical Gearbox",
    category: "Functional Parts",
    desc: "Fully functional planetary gearbox assembly prototype.",
    price: 2500,
    rating: 5.0,
    image: "/images/products/industrial-gears.png"
  },
  {
    name: "Lithophane Lamp",
    category: "Home Decor",
    desc: "Custom photo projection lamp utilizing translucent details.",
    price: 1800,
    rating: 4.9,
    image: "/images/products/fractal-lamp.png"
  },
  {
    name: "Desk Organizer",
    category: "Accessories",
    desc: "Modular tray with phone dock and cable management channels.",
    price: 850,
    rating: 4.7,
    image: "/images/products/custom_keychain.png"
  },
  {
    name: "Custom Name Plate",
    category: "Accessories",
    desc: "Dual-color embossed office desk identification plates.",
    price: 350,
    rating: 4.9,
    image: "/images/products/organic-sculptures.png"
  },
  {
    name: "Articulated Robot",
    category: "Figurines",
    desc: "Poseable multi-jointed robot figure printed in one piece.",
    price: 650,
    rating: 4.8,
    image: "/images/3D%20Fig.jpg"
  },
  {
    name: "Mini Eiffel Tower",
    category: "Architecture",
    desc: "Highly intricate replica showcasing precision lattice bridges.",
    price: 1400,
    rating: 5.0,
    image: "/images/products/architectural-models.png"
  }
];

const materials = [
  {
    name: "PLA",
    tag: "Bio-Friendly Plastic",
    desc: "Bio-friendly starch-based plastic. Easy to print with brilliant color finishes.",
    uses: "Detailed models, prototype mockups, interior decor.",
    strength: "3/5",
    finish: "Gloss / Matte",
    color: "from-blue-500/10 to-indigo-500/10 text-primary border-primary/10"
  },
  {
    name: "PETG",
    tag: "High Durability",
    desc: "Co-polyester blending ease of PLA with high impact and heat resistance.",
    uses: "Snap-fit parts, mechanical assemblies, outdoor enclosures.",
    strength: "4/5",
    finish: "Semi-gloss",
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-500/10"
  },
  {
    name: "ABS",
    tag: "Structural Engineering",
    desc: "Tough engineering thermoplastic with high thermal and chemical resistance.",
    uses: "Automotive parts, LEGO-like assemblies, structural cases.",
    strength: "4.5/5",
    finish: "Matte",
    color: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/10"
  },
  {
    name: "Resin",
    tag: "Micron Precision",
    desc: "Liquid photopolymer cured by UV light for outstanding micron-level detail.",
    uses: "D&D miniatures, dental prototypes, jewelry molds.",
    strength: "3.5/5",
    finish: "Glass-smooth",
    color: "from-purple-500/10 to-fuchsia-500/10 text-purple-600 border-purple-500/10"
  },
  {
    name: "TPU",
    tag: "Flexible & Elastic",
    desc: "Flexible elastomer with high tear strength and rubber-like properties.",
    uses: "Gaskets, phone cases, shock absorbers, flexible couplings.",
    strength: "5/5 (Impact)",
    finish: "Rubber-matte",
    color: "from-rose-500/10 to-pink-500/10 text-rose-600 border-rose-500/10"
  }
];

const portfolioItems = [
  { title: "Vortex Geometry Vase", material: "Standard PLA", time: "18h", size: "aspect-square", img: "/images/products/vortex-vase.png" },
  { title: "Custom Dual-Color Nameplate", material: "Matte PLA", time: "4h", size: "aspect-video", img: "/images/products/organic-sculptures.png" },
  { title: "Planetary Gearbox Assembly", material: "Carbon Fiber PETG", time: "24h", size: "aspect-[3/4]", img: "/images/products/industrial-gears.png" },
  { title: "Detailed Space Marine Bust", material: "8K UV Resin", time: "12h", size: "aspect-[4/3]", img: "/images/products/space_marine_bust.png" },
  { title: "Intricate Lattice Lamp", material: "Translucent PLA", time: "32h", size: "aspect-square", img: "/images/products/fractal-lamp.png" },
  { title: "Precision Prototype Gear", material: "Nylon PA12", time: "8h", size: "aspect-[3/4]", img: "/images/products/prototype_gear.png" }
];

export default function HomeClient() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Indefinite carousel scroller loop
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId: number;
    let scrollAmount = 0;

    const step = () => {
      scrollAmount += 0.4;
      if (container) {
        container.scrollLeft = scrollAmount;
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 1) {
          scrollAmount = 0;
          container.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <HeroSection />

      {/* ── SECTION 2: FEATURED CREATIONS ── */}
      <section className="py-24 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-slate-900"
            >
              Featured Creations
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="mt-3 text-base text-slate-500 max-w-xl mx-auto"
            >
              Discover some of our most loved 3D printed products.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-md"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-slate-50">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 text-[10px] font-bold text-slate-800 shadow-sm uppercase tracking-wider backdrop-blur-sm">
                    {p.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading text-base font-bold text-slate-950 group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 stroke-none" />
                      <span>{p.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                    {p.desc}
                  </p>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Starting Price</span>
                      <span className="text-base font-extrabold text-slate-900">₹{p.price}</span>
                    </div>
                    <Link
                      href="/products"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 group-hover:bg-primary text-slate-500 group-hover:text-white transition-all duration-300 shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: ABOUT GMK ── */}
      <section className="py-24 px-4 sm:px-6 bg-background" id="about">
        <div 
          className="max-w-7xl mx-auto relative overflow-hidden rounded-[32px] p-8 md:p-12 border border-slate-800 shadow-xl bg-cover bg-center"
          style={{ backgroundImage: "url('/images/lets%20connect.jpeg')" }}
        >
          {/* Somewhat visible dark overlay */}
          <div className="absolute inset-0 bg-slate-950/20 z-0" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Layout Visual */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-video lg:aspect-[4/3] rounded-[32px] overflow-hidden border border-white/10 shadow-lg bg-slate-900 group"
            >
              <Image
                src="/images/home-img.jpg"
                alt="3D printed abstract home models"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-102 transition-transform duration-500"
              />
              {/* Visual overlay for premium style */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
            </motion.div>

            {/* Right Layout Editorial */}
            <div className="flex flex-col gap-8">
              <div>
                <motion.span 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-xs font-extrabold text-white bg-primary border border-primary/20 px-3 py-1 rounded-full w-max block mb-3 uppercase tracking-widest shadow-md"
                >
                  Our Core Expertise
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight [text-shadow:_0_2px_10px_rgba(0,0,0,0.4)]"
                >
                  Crafting Precision,<br />Layer by Layer.
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mt-4 text-slate-100 leading-relaxed font-body text-sm sm:text-base font-medium [text-shadow:_0_1px_5px_rgba(0,0,0,0.3)]"
                >
                  At GMK 3D Creations, we bridge the gap between imagination and physical reality. Leveraging industrial-grade additive manufacturing and professional design services, we deliver micro-precise 3D prints for engineering, decor, and hobbyist communities.
                </motion.p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { end: 2500, label: "Orders Completed", suffix: "+" },
                  { end: 1200, label: "Custom Designs", suffix: "+" },
                  { end: 99, label: "Customer Satisfaction", suffix: "%" },
                  { end: 48, label: "Average Delivery", suffix: " Hours" },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-black/60 border border-white/10 backdrop-blur-md rounded-2xl p-5 shadow-sm flex flex-col gap-1 text-white"
                  >
                    <span className="text-2xl font-black text-white font-heading">
                      <AnimatedNumber value={stat.end} />
                      {stat.suffix}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 leading-tight">
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: MATERIALS WE PRINT ── */}
      <section className="py-24 px-4 sm:px-6 bg-background" id="materials">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
              Materials We Print
            </h2>
            <p className="mt-3 text-base text-slate-500 max-w-xl mx-auto">
              Choose the perfect filament or resin matching your application strength and finish.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {materials.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ scale: 1.008 }}
                className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Left: Brand Identity */}
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center border font-heading text-xl font-black`}>
                    {m.name}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                      {m.tag}
                    </span>
                    <h3 className="font-heading text-lg font-extrabold text-slate-950 mt-1">
                      {m.name} Filament
                    </h3>
                  </div>
                </div>

                {/* Center: Specs */}
                <div className="flex-1 md:px-8">
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                    {m.desc}
                  </p>
                  <div className="mt-2 text-[11px] text-slate-600 font-semibold">
                    <span className="text-slate-400">Best for:</span> {m.uses}
                  </div>
                </div>

                {/* Right: Key Stats */}
                <div className="grid grid-cols-2 gap-4 text-left border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8 flex-shrink-0 w-full md:w-auto">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Strength</span>
                    <span className="text-sm font-extrabold text-slate-900">{m.strength}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Finish</span>
                    <span className="text-sm font-extrabold text-slate-900">{m.finish}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: HOW IT WORKS ── */}
      <section className="py-24 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto bg-[#eef2f6] rounded-[32px] p-8 md:p-14 border border-slate-200/60 shadow-sm relative overflow-hidden">
          <div className="text-center mb-16 relative z-10">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
              How It Works
            </h2>
            <p className="mt-3 text-sm text-slate-500 max-w-lg mx-auto">
              A streamlined, high-precision lifecycle from concept to delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4 relative z-10">
            {[
              { step: "01", title: "Upload Design", desc: "Upload STL/OBJ files on our portal.", icon: Upload },
              { step: "02", title: "Review & Quote", desc: "Receive structural review and pricing.", icon: FileText },
              { step: "03", title: "3D Printing", desc: "Our industrial slice system prints details.", icon: Printer },
              { step: "04", title: "Inspection", desc: "Detailed quality & finish evaluation.", icon: Award },
              { step: "05", title: "Delivery", desc: "Securely packed local/express delivery.", icon: CheckCircle },
            ].map((s, idx) => (
              <div key={s.step} className="flex flex-col items-center text-center relative group">
                {/* Dashed Connector Line */}
                {idx < 4 && (
                  <div className="hidden md:block absolute top-10 left-[60%] right-[-40%] h-[1.5px] border-t border-dashed border-slate-300 z-0">
                    <div className="absolute right-0 top-[-3px] w-1.5 h-1.5 border-r border-b border-slate-400 rotate-[-45deg]" />
                  </div>
                )}

                {/* Circle Icon Badge */}
                <div className="w-20 h-20 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-5 shadow-sm text-primary group-hover:scale-105 group-hover:border-primary transition-all duration-300 z-10">
                  <s.icon className="w-8 h-8" />
                </div>

                {/* Step Content */}
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                  Step {s.step}
                </span>
                <h3 className="font-heading text-sm font-extrabold text-slate-950 mb-1.5">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[160px]">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: WHY CHOOSE GMK ── */}
      <section className="py-24 px-4 sm:px-6 bg-background" id="why-choose-gmk">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
              Why Choose GMK
            </h2>
            <p className="mt-3 text-base text-slate-500 max-w-xl mx-auto">
              Engineered layer consistency and technical reliability at every turn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "High Precision Printing",
                desc: "0.1mm accuracy layer height configuration delivers exceptional details in curves and structural profiles.",
                icon: Boxes,
                color: "from-blue-500/10 to-indigo-500/10"
              },
              {
                title: "Premium Materials",
                desc: "PLA, PETG, ABS, Resin, and TPU sourced from trusted chemical hubs ensure durability and beautiful aesthetic finishes.",
                icon: Sparkles,
                color: "from-emerald-500/10 to-teal-500/10"
              },
              {
                title: "Fast Turnaround",
                desc: "Equipped with high-speed cores, we ensure typical 3D printing orders are delivered inside 48 hours.",
                icon: Clock,
                color: "from-amber-500/10 to-orange-500/10"
              },
              {
                title: "Custom Design Assistance",
                desc: "Our CAD specialists provide validation reviews to fix manifold shells and support issues before printing.",
                icon: Shield,
                color: "from-purple-500/10 to-fuchsia-500/10"
              },
              {
                title: "Affordable Pricing",
                desc: "Optimized toolpaths and zero baseline tooling cost ensure direct, affordable options for hobbyists and startups alike.",
                icon: Coins,
                color: "from-rose-500/10 to-pink-500/10"
              },
              {
                title: "Quality Inspection Guarantee",
                desc: "Every print goes through structural, flex, and dimensional checks to ensure error-free deliveries.",
                icon: Award,
                color: "from-teal-500/10 to-cyan-500/10"
              }
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl border border-slate-200/50 p-8 flex flex-col gap-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Large Illustration/Graphic */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-slate-800`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: LATEST PORTFOLIO ── */}
      <section className="py-24 px-4 sm:px-6 bg-background border-t border-slate-100" id="portfolio">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
              Latest Portfolio
            </h2>
            <p className="mt-3 text-base text-slate-500 max-w-xl mx-auto">
              Explore prints engineered for our clients and makers.
            </p>
          </div>

          {/* Masonry / Columns Grid */}
          <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
            {portfolioItems.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.05 }}
                className={`${item.size} relative rounded-3xl overflow-hidden group border border-slate-200/40 bg-slate-50 shadow-sm`}
              >
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                {/* Details revealed on hover */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/20 border border-primary/20 px-2 py-0.5 rounded-full w-max mb-2">
                    {item.material} · Print Time: {item.time}
                  </span>
                  <h3 className="font-heading text-base font-bold text-white mb-2 leading-tight">
                    {item.title}
                  </h3>
                  <Link 
                    href="/products" 
                    className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:text-primary transition-colors mt-1"
                  >
                    View Project <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors shadow-md"
            >
              View Full Portfolio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: CUSTOMER TESTIMONIALS ── */}
      <section className="py-24 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto bg-[#eef2f6] rounded-[32px] p-8 md:p-14 border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
              What Our Customers Say
            </h2>
            <p className="mt-3 text-sm text-slate-500 max-w-sm mx-auto">
              Real feedback from creators, designers, and engineering teams.
            </p>
          </div>

          {/* Autoscrolling flex container */}
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory px-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Duplicating the list to enable continuous seamless scroll wrapper */}
            {[...reviews, ...reviews].map((t, i) => (
              <div
                key={i}
                className="min-w-[280px] sm:min-w-[340px] max-w-[340px] flex-shrink-0 bg-white rounded-2xl p-6 border border-slate-200/50 flex flex-col gap-4 shadow-sm snap-align-start"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400 stroke-none" />
                  ))}
                  {Array.from({ length: 5 - t.stars }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-slate-200 fill-slate-200 stroke-none" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed flex-1 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Customer */}
                <div className="flex items-center gap-3 border-t border-slate-50 pt-4 mt-2">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-slate-100">
                    <img
                      src={reviewAvatars[i % reviewAvatars.length]}
                      alt={t.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 9: CALL TO ACTION ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div 
            className="relative overflow-hidden rounded-[36px] bg-cover bg-center p-10 md:p-20 shadow-2xl border border-slate-800 text-white"
            style={{ backgroundImage: "url('/images/Let%27s%20connect.jpeg')" }}
          >
            {/* Gradient overlay to keep text readable on the left while revealing the crinkly metallic background on the right */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 to-slate-950/60 md:bg-gradient-to-r md:from-slate-950/85 md:via-slate-950/45 md:to-transparent z-0 pointer-events-none" />

            <div className="relative z-10 max-w-xl flex flex-col items-start text-left">
              <motion.div 
                initial={{ scale: 0.95 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-6 text-white"
              >
                <Upload className="w-6 h-6" />
              </motion.div>
              <h2 className="font-heading text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                Have an idea?<br />
                Let&apos;s Bring It To Life.
              </h2>
              <p className="text-sm text-slate-100 leading-relaxed mb-8 font-medium drop-shadow-[0_1px_5px_rgba(0,0,0,0.8)]">
                Upload your custom STL or OBJ models directly. We provide instant material analysis, precision slicing configurations, and rapid turnaround quotes.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/upload"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-sm transition-colors shadow-lg"
                  id="upload-cta"
                >
                  Start Your Project
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/#footer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm transition-colors"
                >
                  Request Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
