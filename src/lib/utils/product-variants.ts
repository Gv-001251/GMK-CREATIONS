import type { Product } from "@/lib/data/products";

/**
 * Size-variant grouping.
 *
 * Products that are the same item in different sizes are grouped so the catalog
 * shows one card per base product, and the product page offers a size selector
 * that switches between the variants. Two naming patterns are supported:
 *
 *   1. Dash form:      "Krishna Golden Bliss Incarnate - Small"
 *   2. Trailing form:  "Hanuman Large"   (size appended with a space, no dash)
 *
 * Each size stays a separate product row with its own id/slug/price/weight.
 */

// Recognised size keywords. Multi-word entries first so "Extra Large" is
// matched before "Large".
const SIZE_KEYWORDS = ["extra large", "small", "medium", "large", "xl", "regular"];

// Explicit sort ranks (smaller value = smaller size).
const SIZE_RANK: Record<string, number> = {
  small: 0,
  medium: 1,
  large: 2,
  "extra large": 3,
  xl: 3,
  regular: 4,
};

export interface VariantInfo {
  base: string;
  size: string;
}

/** Whether a suffix string looks like a size (keyword or a "90mm" dimension). */
function looksLikeSize(size: string): boolean {
  const s = size.toLowerCase().trim();
  return (
    SIZE_KEYWORDS.includes(s) ||
    /\d\s*mm/.test(s) ||
    /\b(small|medium|large|xl|extra\s*large|regular)\b/.test(s)
  );
}

/**
 * Parse a product name into { base, size } when it's a size variant, else null.
 * Handles both "Base - Size" and "Base Size" (trailing size word) forms.
 */
export function parseVariant(name: string): VariantInfo | null {
  if (!name) return null;
  const trimmed = name.trim();

  // Pattern 1 — explicit dash separator: "Base - Size"
  const dashIdx = trimmed.lastIndexOf(" - ");
  if (dashIdx !== -1) {
    const base = trimmed.slice(0, dashIdx).trim();
    const size = trimmed.slice(dashIdx + 3).trim();
    if (base && size && looksLikeSize(size)) {
      return { base, size };
    }
  }

  // Pattern 2 — trailing size word: "Hanuman Large", "Hanuman Extra Large"
  const lower = trimmed.toLowerCase();
  for (const kw of SIZE_KEYWORDS) {
    if (lower.endsWith(" " + kw)) {
      const base = trimmed
        .slice(0, trimmed.length - kw.length)
        .replace(/[-–—]\s*$/, "")
        .trim();
      const size = trimmed.slice(trimmed.length - kw.length).trim();
      if (base) return { base, size };
    }
  }

  return null;
}

/** Sort rank for a size label (lower = smaller). */
function sizeRank(size: string): number {
  const s = size.toLowerCase().trim();
  if (s in SIZE_RANK) return SIZE_RANK[s];
  const mm = s.match(/(\d+)\s*mm/);
  if (mm) return 10 + Number(mm[1]) / 1000; // dimensions ordered after keywords
  if (s.includes("extra large")) return 3;
  if (s.includes("large")) return 2;
  if (s.includes("medium")) return 1;
  if (s.includes("small")) return 0;
  return 99;
}

/**
 * All sibling size-variants of a product (including itself), sorted smallest →
 * largest. Returns an empty array when the product isn't part of a 2+ variant
 * group.
 */
export function getVariantSiblings(product: Product, all: Product[]): Product[] {
  const info = parseVariant(product.name);
  if (!info) return [];
  const key = info.base.toLowerCase();

  const siblings = all.filter((p) => {
    const v = parseVariant(p.name);
    return v && v.base.toLowerCase() === key;
  });

  if (siblings.length < 2) return [];

  return [...siblings].sort((a, b) => {
    const ra = sizeRank(parseVariant(a.name)!.size);
    const rb = sizeRank(parseVariant(b.name)!.size);
    if (ra !== rb) return ra - rb;
    return a.price - b.price;
  });
}

/**
 * Collapse size-variants in a list to a single representative per group,
 * preserving the original ordering. The representative is the cheapest variant,
 * and its name is replaced with the base name for the catalog card. Products
 * without variants (or single-variant "groups") pass through unchanged.
 */
export function collapseVariants(products: Product[]): Product[] {
  const groups = new Map<string, Product[]>();
  for (const p of products) {
    const v = parseVariant(p.name);
    if (!v) continue;
    const key = v.base.toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  const emitted = new Set<string>();
  const result: Product[] = [];

  for (const p of products) {
    const v = parseVariant(p.name);
    if (!v) {
      result.push(p);
      continue;
    }
    const key = v.base.toLowerCase();
    const variants = groups.get(key)!;
    if (variants.length < 2) {
      result.push(p); // singleton — show as-is
      continue;
    }
    if (emitted.has(key)) continue; // representative already emitted
    emitted.add(key);
    const rep = [...variants].sort((a, b) => a.price - b.price)[0];
    result.push({ ...rep, name: v.base });
  }

  return result;
}
