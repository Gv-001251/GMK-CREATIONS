import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AuthGuard } from "@/components/auth-guard";

export const metadata: Metadata = {
  title: "Admin Dashboard | GMK 3D Creations",
  description: "Manage products, orders, and store analytics.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="admin">
      <div className="flex h-screen bg-background overflow-hidden text-foreground">
        <AdminSidebar />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
