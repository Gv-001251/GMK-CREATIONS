"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Menu, X, User, LogOut, Shield, ChevronDown, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { CartDrawer } from "./cart-drawer";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMegaOpen, setMobileMegaOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toggleCart } = useCartStore();
  const itemCount = useCartStore((s) => s.items.reduce((c, i) => c + i.quantity, 0));
  const { user, isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products", isMegaMenu: true },
    { label: "Custom", href: "/upload" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Contact", href: "/#footer" },
  ];

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
  };

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, label: string, href: string) => {
    if (href.startsWith("/#") || href.startsWith("#")) {
      const id = href.split("#")[1];
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/95 shadow-sm backdrop-blur-md py-3"
            : "bg-background py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-container transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-on-surface" />
              ) : (
                <Menu className="w-5 h-5 text-on-surface" />
              )}
            </button>
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-heading text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-on-surface">
                GMK - 3D CREATIONS
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              if (link.isMegaMenu) {
                return (
                  <div
                    key={link.label}
                    className="relative py-2"
                    onMouseEnter={() => setMegaMenuOpen(true)}
                    onMouseLeave={() => setMegaMenuOpen(false)}
                  >
                    <Link
                      href="/products"
                      className={`text-sm font-medium transition-colors flex items-center gap-1 pb-1 ${
                        pathname.startsWith("/products")
                          ? "text-primary font-semibold"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {link.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${megaMenuOpen ? "rotate-180 text-primary" : "text-on-surface-variant"}`} />
                    </Link>

                    {/* Mega Menu Dropdown */}
                    {megaMenuOpen && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-[550px] rounded-3xl bg-background shadow-2xl border border-outline-variant/60 p-5 grid grid-cols-2 gap-3 animate-slide-down z-50">
                        {[
                          { title: "Home Decor", desc: "Vases, planters, and decorative lamps.", href: "/products?category=decor" },
                          { title: "Figurines", desc: "Detailed action figures and sculptures.", href: "/products?category=miniatures" },
                          { title: "Industrial Parts", desc: "Functional prototypes and mechanical gears.", href: "/products?category=prototypes" },
                          { title: "Architecture", desc: "Scaled models and landscape replicas.", href: "/products?category=architecture" },
                          { title: "Accessories", desc: "Custom keychains and daily accessories.", href: "/products?category=edc-gear" },
                          { title: "Custom Orders", desc: "Got a custom file? Upload it for an instant quote.", href: "/upload" },
                        ].map((cat) => (
                          <Link
                            key={cat.title}
                            href={cat.href}
                            onClick={() => setMegaMenuOpen(false)}
                            className="flex flex-col gap-0.5 p-3 rounded-2xl hover:bg-primary/[0.04] border border-transparent hover:border-primary/10 transition-all duration-200 group/item"
                          >
                            <span className="text-sm font-bold text-on-surface group-hover/item:text-primary transition-colors">
                              {cat.title}
                            </span>
                            <span className="text-[11px] text-on-surface-variant leading-normal">
                              {cat.desc}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavLinkClick(e, link.label, link.href)}
                  className={`text-sm font-medium transition-colors relative pb-1 ${
                    pathname === link.href
                      ? "text-primary font-semibold border-b-2 border-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right: User + Cart */}
          <div className="flex items-center gap-2">
            {/* User Auth */}
            {mounted && isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-surface-container transition-colors"
                  id="user-menu-button"
                >
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-on-surface max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-on-surface-variant transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-surface-container-lowest shadow-ambient-lg border border-outline-variant overflow-hidden animate-slide-down z-50">
                    <div className="px-4 py-3 border-b border-outline-variant">
                      <p className="text-sm font-medium text-on-surface truncate">{user.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                      {user.role === "admin" && (
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>

                    <div className="py-1.5">
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors"
                        >
                          <Shield className="w-4 h-4 text-primary" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-on-surface-variant" />
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                        id="logout-button"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-2.5 sm:px-4 py-2 rounded-full hover:bg-surface-container transition-colors text-sm font-medium text-on-surface-variant hover:text-on-surface"
                id="login-link"
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline">Login</span>
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 rounded-full hover:bg-surface-container transition-colors"
              aria-label="Shopping cart"
              id="cart-button"
            >
              <ShoppingCart className="w-5 h-5 text-on-surface" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full gradient-primary text-[10px] font-bold text-white flex items-center justify-center animate-scale-in">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Get a Quote CTA */}
            <Link
              href="/upload"
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full gradient-primary text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 ml-1"
              id="get-quote-cta"
            >
              Get a Quote
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background shadow-lg animate-slide-down border-t border-border">
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => {
                if (link.isMegaMenu) {
                  return (
                    <div key={link.label} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between py-2 w-full">
                        <Link
                          href="/products"
                          onClick={() => setMobileOpen(false)}
                          className="text-base font-semibold text-on-surface hover:text-primary transition-colors flex-grow"
                        >
                          {link.label}
                        </Link>
                        <button
                          onClick={() => setMobileMegaOpen(!mobileMegaOpen)}
                          className="p-2 rounded-lg hover:bg-surface-container transition-colors"
                          aria-label="Toggle products categories"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileMegaOpen ? "rotate-180 text-primary" : ""}`} />
                        </button>
                      </div>

                      {mobileMegaOpen && (
                        <div className="pl-4 flex flex-col gap-3 border-l border-outline-variant/60 py-1">
                          {[
                            { title: "Home Decor", href: "/products?category=decor" },
                            { title: "Figurines", href: "/products?category=miniatures" },
                            { title: "Industrial Parts", href: "/products?category=prototypes" },
                            { title: "Architecture", href: "/products?category=architecture" },
                            { title: "Accessories", href: "/products?category=edc-gear" },
                            { title: "Custom Orders", href: "/upload" },
                          ].map((cat) => (
                            <Link
                              key={cat.title}
                              href={cat.href}
                              onClick={() => {
                                setMobileOpen(false);
                                setMobileMegaOpen(false);
                              }}
                              className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors py-1"
                            >
                              {cat.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-base font-medium transition-colors py-2 ${
                      pathname === link.href
                        ? "text-primary font-semibold"
                        : "text-on-surface hover:text-primary"
                    }`}
                    onClick={(e) => {
                      setMobileOpen(false);
                      handleNavLinkClick(e, link.label, link.href);
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile auth links */}
              <div className="border-t border-outline-variant pt-4 mt-2">
                {mounted && isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-on-surface">{user.name}</p>
                        <p className="text-xs text-on-surface-variant">{user.email}</p>
                      </div>
                    </div>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 py-2 text-sm font-medium text-primary"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Shield className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/orders"
                      className="flex items-center gap-3 py-2 text-sm font-medium text-on-surface"
                      onClick={() => setMobileOpen(false)}
                    >
                      <ShoppingBag className="w-4 h-4 text-on-surface-variant" />
                      My Orders
                    </Link>
                    <button
                      onClick={async () => {
                        await handleLogout();
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-3 py-2 text-sm font-medium text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-3 py-2 text-sm font-medium text-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Login / Register
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      <CartDrawer />
    </>
  );
}
