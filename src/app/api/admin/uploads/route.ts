import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";

// Orders in these statuses are still being fulfilled, so their uploaded model
// files are "locked" (cannot be deleted until the order is delivered/cancelled).
const ACTIVE_ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped"];

export async function GET() {
  // Only admin users can list all uploads
  const adminUser = await requireAdmin();
  if (!adminUser) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Use admin client which has service role token bypassing RLS
  const admin = createAdminClient();

  try {
    const { data: uploads, error: uploadsError } = await admin
      .from("uploads")
      .select("*")
      .order("created_at", { ascending: false });

    if (uploadsError) {
      console.error("Error fetching uploads:", uploadsError.message);
      return Response.json({ error: uploadsError.message }, { status: 500 });
    }

    if (!uploads || uploads.length === 0) {
      return Response.json([]);
    }

    // Resolve profile names in-memory to prevent schema/relationship query resolution issues
    const userIds = Array.from(new Set(uploads.map((u: any) => u.user_id).filter(Boolean)));
    
    const profileMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await admin
        .from("profiles")
        .select("id, name")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles for uploads:", profilesError.message);
      } else if (profiles) {
        profiles.forEach((p: any) => {
          profileMap[p.id] = p.name;
        });
      }
    }

    // Determine which uploaded files are tied to orders and each order's status,
    // so the UI can lock deletion for files still being fulfilled.
    const pathToOrderIds = new Map<string, Set<string>>();
    try {
      const { data: fileItems } = await admin
        .from("order_items")
        .select("finish, order_id")
        .ilike("finish", "%[File:%");

      (fileItems || []).forEach((it: { finish: string | null; order_id: string | null }) => {
        const m = (it.finish || "").match(/\[File:\s*(.*?)\]/);
        if (m && it.order_id) {
          const p = m[1].trim();
          if (!pathToOrderIds.has(p)) pathToOrderIds.set(p, new Set());
          pathToOrderIds.get(p)!.add(it.order_id);
        }
      });
    } catch (e) {
      console.error("Failed to map order files:", e);
    }

    const statusById = new Map<string, string>();
    const allOrderIds = Array.from(
      new Set([...pathToOrderIds.values()].flatMap((s) => [...s]))
    );
    if (allOrderIds.length > 0) {
      const { data: ords } = await admin.from("orders").select("id, status").in("id", allOrderIds);
      (ords || []).forEach((o: { id: string; status: string }) => statusById.set(o.id, o.status));
    }

    const lockInfo = (storagePath: string): { locked: boolean; order_status: string | null } => {
      const orderIds = pathToOrderIds.get(storagePath);
      if (!orderIds || orderIds.size === 0) return { locked: false, order_status: null };
      let blockingStatus: string | null = null;
      let anyStatus: string | null = null;
      for (const oid of orderIds) {
        const status = statusById.get(oid) || null;
        if (status && !anyStatus) anyStatus = status;
        if (status && ACTIVE_ORDER_STATUSES.includes(status)) {
          blockingStatus = status;
          break;
        }
      }
      return { locked: !!blockingStatus, order_status: blockingStatus || anyStatus };
    };

    // Combine uploads with user profile names and lock status
    const uploadsWithUser = uploads.map((upload: any) => ({
      ...upload,
      user_name: profileMap[upload.user_id] || "Unknown User",
      ...lockInfo(upload.storage_path),
    }));

    return Response.json(uploadsWithUser);
  } catch (err: any) {
    console.error("Admin uploads error:", err);
    return Response.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
