"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Layers, 
  ClipboardList, 
  Upload,
  LogOut,
  Globe
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const navItems = [
    { name: "Overview", href: "/admin", icon: BarChart3 },
    { name: "Products", href: "/admin/products", icon: Layers },
    { name: "Orders", href: "/admin/orders", icon: ClipboardList },
    { name: "Uploads", href: "/admin/uploads", icon: Upload },
  ];

  return (
    <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-outline-variant">
        <span className="font-heading font-bold text-on-surface tracking-tight">
          GMK ADMIN
        </span>
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
  );
}
