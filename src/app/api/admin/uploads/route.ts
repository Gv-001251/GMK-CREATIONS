import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/server";

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

    // Combine uploads with user profile names
    const uploadsWithUser = uploads.map((upload: any) => ({
      ...upload,
      user_name: profileMap[upload.user_id] || "Unknown User",
    }));

    return Response.json(uploadsWithUser);
  } catch (err: any) {
    console.error("Admin uploads error:", err);
    return Response.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
