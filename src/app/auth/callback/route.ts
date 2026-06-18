import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Fetch user to check if they are the admin
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email === "admin@gmk3d.com") {
        return NextResponse.redirect(`${origin}/admin`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect back to login with an error message on failure
  return NextResponse.redirect(
    `${origin}/login?error=Google authentication failed. Please try again.`
  );
}
