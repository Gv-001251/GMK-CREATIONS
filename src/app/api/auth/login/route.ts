import { createClient } from "@/lib/supabase/server";
import { safeParseRequest, loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const parsed = await safeParseRequest(request, loginSchema);
  if (!parsed.success) return parsed.response;

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return Response.json({ error: error.message }, { status: 401 });

  // Fetch profile for role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  return Response.json({ user: { ...data.user, profile } });
}
