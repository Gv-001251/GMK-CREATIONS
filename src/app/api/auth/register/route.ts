import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, password, name } = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ user: data.user });
}
