"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

// Custom SVG LinkedIn Icon
const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Custom SVG Facebook Icon
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer
      className="relative pt-24 pb-12 px-6 sm:px-12 md:px-16 bg-[#09090b] border-t border-slate-900 text-white"
      id="footer"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        
        {/* Main Footer Links Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          
          {/* Column 1: Company */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-xs font-bold tracking-widest uppercase text-slate-400">
              Company
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/#about" onClick={(e) => handleScrollTo(e, "/#about")} className="hover:text-primary transition-colors">
                  About GMK
                </Link>
              </li>
              <li>
                <Link href="/#why-choose-gmk" onClick={(e) => handleScrollTo(e, "/#why-choose-gmk")} className="hover:text-primary transition-colors">
                  Why Choose Us
                </Link>
              </li>
              {/* <li>
                <Link href="/#portfolio" onClick={(e) => handleScrollTo(e, "/#portfolio")} className="hover:text-primary transition-colors">
                  Client Work
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Column 2: Products */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-xs font-bold tracking-widest uppercase text-slate-400">
              Products
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/products?category=decor" className="hover:text-primary transition-colors">
                  Home Decor
                </Link>
              </li>
              <li>
                <Link href="/products?category=miniatures" className="hover:text-primary transition-colors">
                  Figurines
                </Link>
              </li>
              <li>
                <Link href="/products?category=prototypes" className="hover:text-primary transition-colors">
                  Industrial Parts
                </Link>
              </li>
              <li>
                <Link href="/products?category=architecture" className="hover:text-primary transition-colors">
                  Architecture
                </Link>
              </li>
              <li>
                <Link href="/products?category=edc-gear" className="hover:text-primary transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-xs font-bold tracking-widest uppercase text-slate-400">
              Services
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/upload" className="hover:text-primary transition-colors">
                  Custom 3D Printing
                </Link>
              </li>
              {/* <li>
                <Link href="/upload" className="hover:text-primary transition-colors">
                  Rapid Prototyping
                </Link>
              </li>
              <li>
                <Link href="/upload" className="hover:text-primary transition-colors">
                  CAD File Review
                </Link>
              </li>
              <li>
                <Link href="/upload" className="hover:text-primary transition-colors">
                  Direct Quote
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-xs font-bold tracking-widest uppercase text-slate-400">
              Resources
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/#materials" onClick={(e) => handleScrollTo(e, "/#materials")} className="hover:text-primary transition-colors">
                  Materials Guide
                </Link>
              </li>
              <li>
                <Link href="/#" className="hover:text-primary transition-colors">
                  Printing FAQs
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-primary transition-colors">
                  Direct Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <h3 className="font-heading text-xs font-bold tracking-widest uppercase text-slate-400">
              Contact
            </h3>
            <div className="flex flex-col gap-3.5 text-xs text-slate-400 leading-relaxed font-medium">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
                <span>31/12, Rajagopal Layout, Avarampalayam Road, Peelamedu, Coimbatore - 641 004.</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-slate-500" />
                <a href="mailto:gmk3dcreations@gmail.com" className="hover:text-primary transition-colors">
                  gmk3dcreations@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-slate-500" />
                <div className="flex flex-col gap-0.5">
                  <a href="tel:+919344581320" className="hover:text-primary transition-colors">(+91) 93445 81320</a>
                  <a href="tel:+919944215100" className="hover:text-primary transition-colors">(+91) 99442 15100</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links & Newsletter Sub-section */}
        <div className="border-t border-slate-900 pt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Circular Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/gmk_3dcreations?igsh=bzVjemw2eGVwazNy"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-slate-800 bg-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:border-primary hover:bg-primary/5 transition-all duration-300"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
            <a
              href="https://x.com/ManojKannan03"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-slate-800 bg-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:border-primary hover:bg-primary/5 transition-all duration-300"
              aria-label="X"
            >
              <XLogoIcon className="w-4.5 h-4.5" />
            </a>
            <a
              href="https://www.linkedin.com/in/manoj-kannan-356985293?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-slate-800 bg-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:border-primary hover:bg-primary/5 transition-all duration-300"
              aria-label="LinkedIn"
            >
              <LinkedinIcon className="w-5 h-5" />
            </a>
            <a
              href="https://www.facebook.com/share/18nKn2GpTG/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-slate-800 bg-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:border-primary hover:bg-primary/5 transition-all duration-300"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Lower Sub-Footer Legal & Policy Links */}
        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="max-w-md text-center md:text-left">
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Precision materiality for your digital concepts. From engineering prototypes to intricate architectural replicas, we transform ideas into custom 3D reality.
            </p>
          </div>
          
          <div className="flex gap-6 text-[10px] font-bold tracking-wider text-slate-500">
            <Link href="/terms" className="hover:text-primary transition-colors">
              TERMS & CONDITIONS
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              PRIVACY POLICY
            </Link>
          </div>
        </div>

        {/* Centered Copyright Line */}
        <div className="text-center text-[10px] text-slate-600 tracking-wider font-semibold border-t border-slate-900/50 pt-8">
          GMK – 3D CREATIONS © 2026. ALL RIGHTS RESERVED.
          <br /><br />
          MADE BY &nbsp;
          <a
            href="https://www.lumerlabs.in"
            target="_blank"
            className="hover:text-primary transition-colors">
              LUMERLABS
          </a>
        </div>
      </div>
    </footer>
  );
}
