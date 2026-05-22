import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/auth/seed-users
 *
 * Creates two test accounts:
 *   Admin  → admin@gmk3d.com  / Admin@123
 *   User   → user@gmk3d.com   / User@123
 *
 * Safe to call multiple times — skips if the account already exists.
 * This route is meant for local development only.
 */
export async function POST() {
  const supabase = createAdminClient();

  const accounts = [
    {
      email: "admin@gmk3d.com",
      password: "Admin@123",
      name: "GMK Admin",
      label: "admin",
    },
    {
      email: "user@gmk3d.com",
      password: "User@123",
      name: "Test User",
      label: "user",
    },
  ];

  const results: { email: string; status: string; role: string }[] = [];

  for (const account of accounts) {
    // createUser via admin API — bypasses email confirmation
    const { error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true, // auto-confirm so they can log in immediately
      user_metadata: { name: account.name },
    });

    if (error) {
      // If user already exists, that's fine
      if (error.message?.toLowerCase().includes("already") ||
          error.message?.toLowerCase().includes("exists")) {
        results.push({
          email: account.email,
          status: "already exists",
          role: account.label,
        });
      } else {
        results.push({
          email: account.email,
          status: `error: ${error.message}`,
          role: account.label,
        });
      }
    } else {
      results.push({
        email: account.email,
        status: "created",
        role: account.label,
      });
    }
  }

  return Response.json({
    message: "Seed users complete",
    accounts: results,
    credentials: {
      admin: { email: "admin@gmk3d.com", password: "Admin@123" },
      user: { email: "user@gmk3d.com", password: "User@123" },
    },
  });
}
