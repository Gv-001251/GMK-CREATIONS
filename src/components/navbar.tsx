"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Menu, X, User, LogOut, Shield, ChevronDown, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { CartDrawer } from "./cart-drawer";
import { usePathname, useRouter } from "next/navigation";

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
  const router = useRouter();
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
    { label: "Contact", href: "/contact" },
  ];

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    router.push("/login");
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#09090b]/90 shadow-2xl backdrop-blur-xl border-b border-white/10 py-3"
            : "bg-[#09090b]/50 backdrop-blur-md py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors text-white"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-heading text-sm sm:text-base md:text-lg font-bold tracking-wider text-white uppercase group-hover:text-white/80 transition-colors">
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
                          ? "text-white font-semibold"
                          : "text-zinc-300 hover:text-white"
                      }`}
                    >
                      {link.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${megaMenuOpen ? "rotate-180 text-white" : "text-zinc-400"}`} />
                    </Link>

                    {/* Mega Menu Dropdown */}
                    {megaMenuOpen && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-140 rounded-3xl bg-[#121216]/98 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 p-5 grid grid-cols-2 gap-3 animate-slide-down z-50 backdrop-blur-2xl">
                        {[
                          { title: "Figurines & Collectibles", desc: "Detailed action figures, sculptures & tabletop models.", href: "/products?category=miniatures" },
                          { title: "Architectural Models", desc: "Precision scale models & landscape replicas.", href: "/products?category=architecture" },
                          { title: "Functional Parts", desc: "High-tolerance mechanical prototypes & gears.", href: "/products?category=prototypes" },
                          { title: "Home Decor & Art", desc: "Parametric vases, planters, and ambient lamps.", href: "/products?category=decor" },
                          { title: "Fashion & Accessories", desc: "Custom keychains, rings, and EDC items.", href: "/products?category=edc-gear" },
                          { title: "Fitness & Trophies", desc: "Gym sculptures, awards, and workout gear.", href: "/products?category=fitness" },
                          { title: "Custom 3D Printing", desc: "Upload your CAD / STL for instant slicing.", href: "/upload" },
                        ].map((cat) => (
                          <Link
                            key={cat.title}
                            href={cat.href}
                            onClick={() => setMegaMenuOpen(false)}
                            className="flex flex-col gap-0.5 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200 group/item"
                          >
                            <span className="text-sm font-semibold text-zinc-100 group-hover/item:text-white transition-colors">
                              {cat.title}
                            </span>
                            <span className="text-[11px] text-zinc-400 leading-normal">
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
                      ? "text-white font-semibold border-b-2 border-white"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right: User + Cart + Get a Quote */}
          <div className="flex items-center gap-3">
            {/* User Auth */}
            {mounted && isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-zinc-200"
                  id="user-menu-button"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-zinc-200 max-w-25 truncate">
                    {user.name}
                  </span>
                  <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-zinc-400 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#141418] shadow-2xl border border-white/10 overflow-hidden animate-slide-down z-50">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                      {user.role === "admin" && (
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-semibold uppercase tracking-wider">
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
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/5 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-blue-400" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/5 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-zinc-400" />
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-sm font-medium text-zinc-300 hover:text-white"
                id="login-link"
              >
                <User className="w-4 h-4 text-zinc-400" />
                <span>Login</span>
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              aria-label="Shopping cart"
              id="cart-button"
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center animate-scale-in shadow-md">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Get a Quote CTA */}
            <Link
              href="/upload"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] hover:scale-102"
              id="get-quote-cta"
            >
              Get a Quote
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-[#0c0c0e]/95 backdrop-blur-2xl shadow-2xl animate-slide-down border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => {
                if (link.isMegaMenu) {
                  return (
                    <div key={link.label} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between py-2 w-full">
                        <Link
                          href="/products"
                          onClick={() => setMobileOpen(false)}
                          className="text-base font-semibold text-white hover:text-blue-400 transition-colors grow"
                        >
                          {link.label}
                        </Link>
                        <button
                          onClick={() => setMobileMegaOpen(!mobileMegaOpen)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          aria-label="Toggle products categories"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileMegaOpen ? "rotate-180 text-white" : "text-zinc-400"}`} />
                        </button>
                      </div>

                      {mobileMegaOpen && (
                        <div className="pl-4 flex flex-col gap-3 border-l border-white/10 py-1">
                          {[
                            { title: "Figurines & Collectibles", href: "/products?category=miniatures" },
                            { title: "Architectural Models", href: "/products?category=architecture" },
                            { title: "Functional Parts", href: "/products?category=prototypes" },
                            { title: "Home Decor & Art", href: "/products?category=decor" },
                            { title: "Fashion & Accessories", href: "/products?category=edc-gear" },
                            { title: "Fitness & Trophies", href: "/products?category=fitness" },
                            { title: "Custom Orders", href: "/upload" },
                          ].map((cat) => (
                            <Link
                              key={cat.title}
                              href={cat.href}
                              onClick={() => {
                                setMobileOpen(false);
                                setMobileMegaOpen(false);
                              }}
                              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors py-1"
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
                        ? "text-white font-semibold"
                        : "text-zinc-300 hover:text-white"
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
              <div className="border-t border-white/10 pt-4 mt-2">
                {mounted && isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-zinc-400">{user.email}</p>
                      </div>
                    </div>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 py-2 text-sm font-medium text-blue-400"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Shield className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/orders"
                      className="flex items-center gap-3 py-2 text-sm font-medium text-zinc-200"
                      onClick={() => setMobileOpen(false)}
                    >
                      <ShoppingBag className="w-4 h-4 text-zinc-400" />
                      My Orders
                    </Link>
                    <button
                      onClick={async () => {
                        await handleLogout();
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-3 py-2 text-sm font-medium text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-3 py-2 text-sm font-medium text-white"
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
