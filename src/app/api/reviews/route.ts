import { createClient } from "@/lib/supabase/server";
import { safeParseRequest, createReviewSchema } from "@/lib/validations";

// ── GET /api/reviews?productId=<id> ──────────────────────────────────────────
// Public: returns all reviews for a product, newest first.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return Response.json({ error: "productId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, author_name, rating, comment, verified, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch reviews:", error.message);
    return Response.json({ error: "Failed to load reviews." }, { status: 500 });
  }

  return Response.json({ reviews: data || [] });
}

// ── POST /api/reviews ────────────────────────────────────────────────────────
// Auth required. Creates (or updates) the signed-in user's review for a product.
// Marks the review as a verified purchase when the user has actually ordered it.
export async function POST(request: Request) {
  const parsed = await safeParseRequest(request, createReviewSchema);
  if (!parsed.success) return parsed.response;

  const { productId, rating, comment } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: "You must be signed in to leave a review." },
      { status: 401 }
    );
  }

  // Display name from the profile, falling back to the email prefix.
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const authorName =
    (profile?.name && profile.name.trim()) ||
    user.email?.split("@")[0] ||
    "Anonymous";

  // "Verified purchase": did this user buy this product in a non-pending order?
  let verified = false;
  try {
    const { data: orders } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", user.id)
      .neq("status", "pending");

    const orderIds = (orders || []).map((o) => o.id);
    if (orderIds.length > 0) {
      const { data: items } = await supabase
        .from("order_items")
        .select("id")
        .eq("product_id", productId)
        .in("order_id", orderIds)
        .limit(1);
      verified = !!(items && items.length > 0);
    }
  } catch (e) {
    console.error("Verified-purchase check failed (non-fatal):", e);
  }

  // Upsert so a user's repeat submission updates their existing review
  // rather than creating duplicates (enforced by the product_id+user_id unique key).
  const { error } = await supabase.from("reviews").upsert(
    {
      product_id: productId,
      user_id: user.id,
      author_name: authorName,
      rating,
      comment: comment.trim(),
      verified,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "product_id,user_id" }
  );

  if (error) {
    console.error("Failed to save review:", error.message);
    return Response.json({ error: "Failed to save your review." }, { status: 500 });
  }

  return Response.json({ success: true, verified });
}
