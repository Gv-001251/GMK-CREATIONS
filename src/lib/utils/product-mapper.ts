import type { Product } from "@/lib/data/products";

/**
 * Convert a snake_case product row from Supabase into the camelCase `Product`
 * shape used throughout the app. Pure function — safe to use on both the
 * server (SSR) and the client (Zustand store).
 */
export function rowToProduct(row: Record<string, unknown>): Product {
  const id = row.id as string;
  const isGMK = id && id.startsWith("GMK-");

  const price = Number(row.price) || 0;
  const priceLabel = (row.price_label as string) || undefined;
  const badge = (row.badge as string) || undefined;
  const isNew = (row.is_new as boolean) || false;
  let description = (row.description as string) || "";

  if (isGMK) {
    // Keep the DB pricing intact: `price` is what the customer pays (the
    // discounted price) and `priceLabel` is the struck-through original price,
    // so any discount is displayed. Only normalize the marketing copy.
    const cleanDesc = description.replace(/^Premium\s+/i, "");
    description = cleanDesc ? cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1) : "";
  }

  return {
    id,
    name: row.name as string,
    slug: row.slug as string,
    description,
    longDescription: (row.long_description as string) || "",
    price,
    priceLabel,
    category: (row.category as string) || "general",
    image: (row.image as string) || "",
    images: (row.images as string[]) || [],
    badge,
    materials: (row.materials as string[]) || [],
    finishes: (row.finishes as string[]) || [],
    layerHeight: (row.layer_height as string) || "",
    infillDensity: (row.infill_density as string) || "",
    recommendedApplication: (row.recommended_application as string) || "",
    productionDays: (row.production_days as number) || 5,
    weight: Number(row.weight) || 0,
    featured: (row.featured as boolean) || false,
    isNew,
    createdAt: (row.created_at as string) || undefined,
    isDualColor:
      (row.is_dual_color as boolean) ||
      (row.name as string)?.toLowerCase().includes("keychain") ||
      (row.name as string)?.toLowerCase().includes("nameplate") ||
      (row.name as string)?.toLowerCase().includes("desk") ||
      false,
  };
}
