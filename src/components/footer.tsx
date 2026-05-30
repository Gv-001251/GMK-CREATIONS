"use client";

import Link from "next/link";
import { Globe, Share2, Mail } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const footerSections = [
    {
      title: "Shop",
      links: [
        { label: "All Products", href: "/products" },
        { label: "Upload Model", href: "/upload" },
        { label: "My Orders", href: "/orders" },
        { label: "Cart", href: "/cart" },
      ],
    },
    {
      title: "Help",
      links: [
        { label: "Contact Support", href: "mailto:support@gmk3d.com" },
        { label: "Shipping Info", href: "/checkout" },
        { label: "My Account", href: "/login" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/" },
        { label: "Our Products", href: "/products" },
      ],
    },
  ];

  return (
    <footer className="bg-surface-container-low" id="footer">
      {/* Brand Statement */}
      {isHomePage && (
        <div className="bg-[#e8e6d8] py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto text-center">
            <p className="font-heading text-lg md:text-xl text-on-surface/80 max-w-2xl mx-auto leading-relaxed">
              We have designs that suit your style and which you&apos;re proud to own. From prototypes to art.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Link
                href="/"
                className="p-3 rounded-full bg-on-surface/10 hover:bg-on-surface/20 transition-colors"
                aria-label="Website"
              >
                <Globe className="w-5 h-5 text-on-surface/70" />
              </Link>
              <Link
                href="/"
                className="p-3 rounded-full bg-on-surface/10 hover:bg-on-surface/20 transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5 text-on-surface/70" />
              </Link>
              <Link
                href="/"
                className="p-3 rounded-full bg-on-surface/10 hover:bg-on-surface/20 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-on-surface/70" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {isHomePage ? (
          <div className="py-16">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Logo & Info */}
              <div className="lg:w-1/4">
                <h3 className="font-heading text-lg font-bold tracking-tight text-on-surface">
                  GMK — 3D CREATIONS
                </h3>
                <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">
                  Precision materiality for your digital concepts. Custom prototypes, miniatures, and intricate art.
                </p>
              </div>

              {/* Links Grid */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
                {footerSections.map((section) => (
                  <div key={section.title}>
                    <h4 className="font-heading text-sm font-semibold text-on-surface uppercase tracking-wider mb-4">
                      {section.title}
                    </h4>
                    <ul className="space-y-3">
                      {section.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-16 pt-8 border-t border-outline-variant">
              <p className="text-xs text-on-surface-variant text-center">
                GMK — 3D CREATIONS © {new Date().getFullYear()}. ALL RIGHTS RESERVED.
              </p>
            </div>
          </div>
        ) : (
          <div className="py-8">
            <p className="text-xs text-on-surface-variant text-center">
              GMK — 3D CREATIONS © {new Date().getFullYear()}. ALL RIGHTS RESERVED.
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}

