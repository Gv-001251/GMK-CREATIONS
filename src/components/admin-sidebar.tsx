"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Layers,
  ClipboardList,
  Upload,
  LogOut,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: "Overview", href: "/admin", icon: BarChart3 },
    { name: "Products", href: "/admin/products", icon: Layers },
    { name: "Orders", href: "/admin/orders", icon: ClipboardList },
    { name: "Uploads", href: "/admin/uploads", icon: Upload },
  ];

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Mobile top bar (hidden on md+) */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-4 bg-surface-container-lowest border-b border-outline-variant">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          className="p-2 -ml-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-heading font-bold text-on-surface tracking-tight">GMK ADMIN</span>
        <span className="w-9" aria-hidden />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — a fixed off-canvas drawer on mobile, a sticky rail on desktop */}
      <aside
        className={`fixed md:sticky top-0 z-50 md:z-auto w-64 max-w-[80vw] h-screen bg-surface-container-lowest border-r border-outline-variant flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-outline-variant">
          <span className="font-heading font-bold text-on-surface tracking-tight">
            GMK ADMIN
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="md:hidden p-1.5 -mr-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4 px-2">
            Dashboard
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "gradient-primary text-white"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-on-surface-variant"}`} />
                {item.name}
              </Link>
            );
          })}

          <div className="mt-8 mb-4">
            <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4 px-2">
              Storefront
            </div>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
            >
              <Globe className="w-4 h-4" />
              View Store
            </Link>
          </div>
        </nav>

        {/* Footer / User Actions */}
        <div className="p-4 border-t border-outline-variant">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
