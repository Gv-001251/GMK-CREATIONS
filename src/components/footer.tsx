"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { usePathname } from "next/navigation";

// Custom SVG Instagram Icon
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// Custom SVG X (formerly Twitter) Icon
const XLogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Custom SVG YouTube Icon
const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="10 15 15 12 10 9" fill="currentColor" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export function Footer() {
  const pathname = usePathname();

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#") || (href.startsWith("/#") && pathname === "/")) {
      const id = href.replace(/^\/?#/, "");
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer
      className="relative bg-neutral-950 text-white pt-20 pb-10 px-6 sm:px-12 md:px-16 overflow-hidden border-t border-white/5"
      id="footer"
      style={{ backgroundColor: "#0d0d0f" }}
    >
      {/* Giant background text: GMK CREATIONS */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[12vw] font-bold uppercase tracking-tighter select-none pointer-events-none whitespace-nowrap font-heading leading-none z-0"
        style={{ color: "rgba(255, 255, 255, 0.018)" }}
      >
        gmk.-creations
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Row: Info & Links */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-16 pb-12">
          {/* Left Block: Contact / Socials */}
          <div className="flex flex-col gap-6 max-w-sm" id="contact-info">
            {/* Social Icons inside circles */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/gmk_3dcreations?igsh=bzVjemw2eGVwazNy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 hover:border-white/40 bg-white/5 hover:bg-white/10 hover:scale-105 transition-all flex items-center justify-center text-white"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-white/10 hover:border-white/40 bg-white/5 hover:bg-white/10 hover:scale-105 transition-all flex items-center justify-center text-white"
                aria-label="X (formerly Twitter)"
              >
                <XLogoIcon className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-white/10 hover:border-white/40 bg-white/5 hover:bg-white/10 hover:scale-105 transition-all flex items-center justify-center text-white"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-5 h-5" />
              </a>
            </div>

            {/* Address and details */}
            <div className="space-y-4 font-body text-white/70 text-sm leading-relaxed">
              <p className="font-heading text-lg font-bold tracking-tight text-white">GMK 3D Creations</p>
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4.5 h-4.5 text-white/40 shrink-0 mt-0.5" />
                <span>31/12, RAJAGOPAL LAYOUT, AVARAMPALAYAM ROAD, PEELAMEDU
COIMBATORE -641 004</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4.5 h-4.5 text-white/40 shrink-0" />
                <a href="mailto:gmk3dcreations@gmail.com" className="hover:text-white hover:underline transition-all">
                  gmk3dcreations@gmail.com
                </a>
              </p>
              <div className="flex flex-col gap-2">
                <p className="flex items-center gap-2.5">
                  <Phone className="w-4.5 h-4.5 text-white/40 shrink-0" />
                  <a href="tel:+919344581320" className="hover:text-white hover:underline transition-all">
                    (+91) 93445 81320
                  </a>
                </p>
                <p className="flex items-center gap-2.5 pl-7">
                  <a href="tel:+919944215100" className="hover:text-white hover:underline transition-all">
                    (+91) 99442 15100
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Right Block: Navigation Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 lg:w-2/3">
            {/* Column 1: MENU */}
            <div>
              <h3 className="font-heading text-xs font-semibold tracking-widest text-white uppercase mb-5">
                Menu
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/#why-choose-us"
                    onClick={(e) => handleScrollTo(e, "/#why-choose-us")}
                    className="text-white/60 hover:text-white transition-colors text-sm font-body"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#categories"
                    onClick={(e) => handleScrollTo(e, "/#categories")}
                    className="text-white/60 hover:text-white transition-colors text-sm font-body"
                  >
                    Categories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="text-white/60 hover:text-white transition-colors text-sm font-body"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/upload"
                    className="text-white/60 hover:text-white transition-colors text-sm font-body"
                  >
                    Upload STL
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: SHOP */}
            <div>
              <h3 className="font-heading text-xs font-semibold tracking-widest text-white uppercase mb-5">
                Shop
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/products?category=custom"
                    className="text-white/60 hover:text-white transition-colors text-sm font-body"
                  >
                    Custom Prints
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?category=miniatures"
                    className="text-white/60 hover:text-white transition-colors text-sm font-body"
                  >
                    Miniatures
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?category=art"
                    className="text-white/60 hover:text-white transition-colors text-sm font-body"
                  >
                    Artistic Models
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products?category=prototypes"
                    className="text-white/60 hover:text-white transition-colors text-sm font-body"
                  >
                    Prototypes
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: CART/SUPPORT */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-heading text-xs font-semibold tracking-widest text-white uppercase mb-5">
                Cart & Help
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/cart"
                    className="text-white/60 hover:text-white transition-colors text-sm font-body"
                  >
                    Shopping Cart
                  </Link>
                </li>
                <li>
                  <Link
                    href="/orders"
                    className="text-white/60 hover:text-white transition-colors text-sm font-body"
                  >
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link
                    href="#contact-info"
                    onClick={(e) => handleScrollTo(e, "#contact-info")}
                    className="text-white/60 hover:text-white transition-colors text-sm font-body"
                  >
                    Contact Info
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:gmk3dcreations@gmail.com"
                    className="text-white/60 hover:text-white transition-colors text-sm font-body"
                  >
                    Direct Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider Line with Overlapping Pill Button */}
        <div className="relative flex items-center py-6">
          <div className="flex-grow border-t border-white/10"></div>
          <div className="absolute right-0 bg-[#0d0d0f] pl-4" style={{ backgroundColor: "#0d0d0f" }}>
            <Link
              href="/upload"
              className="bg-white text-black hover:scale-105 active:scale-95 transition-all font-heading text-xs font-bold px-6 py-2.5 rounded-full shadow-md inline-block text-center tracking-wide"
              style={{ backgroundColor: "#ffffff", color: "#000000" }}
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 text-white/50 text-xs font-body">
          <div className="max-w-md">
            <p className="leading-relaxed">
              Precision materiality for your digital concepts. From prototyping to intricate art, we transform your ideas into custom 3D reality.
            </p>
          </div>
          <div className="flex gap-6 font-semibold tracking-wider text-[10px]">
            <Link href="/terms" className="hover:text-white transition-colors uppercase">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors uppercase">
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-4 border-t border-white/5 text-center text-[10px] text-white/20 tracking-widest font-heading uppercase">
          GMK — 3D CREATIONS © {new Date().getFullYear()}. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}
