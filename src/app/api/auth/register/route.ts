import { createClient } from "@/lib/supabase/server";
import { safeParseRequest, registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const parsed = await safeParseRequest(request, registerSchema);
  if (!parsed.success) return parsed.response;

  const { email, password, name } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ user: data.user }, { status: 201 });
}
