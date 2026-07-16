import { createClient, requireAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Only admin users can bulk insert products
  const adminUser = await requireAdmin();
  if (!adminUser) return Response.json({ error: "Forbidden" }, { status: 403 });

  const supabase = await createClient();
  const products = await request.json();

  if (!Array.isArray(products) || products.length === 0) {
    return Response.json({ error: "Invalid data format or empty array" }, { status: 400 });
  }

  const DEFAULT_IMAGE_BY_CATEGORY: Record<string, string> = {
    art: "/images/products/organic-sculptures.png",
    trophy: "/images/products/apex-stand.png",
  };

  // First non-empty value across a list of candidate column names. This lets a
  // single import handle the "Product Master" CSV headers ("Product Name",
  // "Selling Price", ...) as well as camelCase / snake_case keys.
  const pick = (row: Record<string, unknown>, keys: string[]): string => {
    for (const k of keys) {
      const v = row[k];
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        return String(v).trim();
      }
    }
    return "";
  };

  // Strips currency symbols, thousands separators, and units → number.
  const parseNumber = (value: unknown): number =>
    Number(String(value ?? "").replace(/[^0-9.]/g, "")) || 0;

  // Accepts either a comma-separated string (from CSV) or an existing array.
  const toArray = (value: unknown, fallback: string[]): string[] => {
    if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean);
    if (typeof value === "string" && value.trim()) {
      return value.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return fallback;
  };

  const slugify = (value: string): string =>
    value
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const uniqueSuffix = Date.now().toString(36);

  // Pre-load existing slugs so a generated slug never collides with a row
  // already in the table. A single slug unique-constraint violation would fail
  // the entire upsert and silently drop every product in the batch. Map each
  // slug to the product id that owns it.
  const slugOwners = new Map<string, string>();
  {
    const { data: existing } = await supabase.from("products").select("id, slug");
    (existing || []).forEach((r: { id: string; slug: string | null }) => {
      if (r.slug) slugOwners.set(r.slug, r.id);
    });
  }

  // Returns a slug that is unique across both the DB and the current batch for
  // the given product id (reuses the same slug when the id already owns it).
  const makeUniqueSlug = (base: string, id: string): string => {
    let candidate = base;
    let n = 2;
    while (true) {
      const owner = slugOwners.get(candidate);
      if (!owner || owner === id) {
        slugOwners.set(candidate, id);
        return candidate;
      }
      candidate = `${base}-${n++}`;
    }
  };

  // Sanitize and map each row to the DB schema (snake_case columns). The
  // products table requires a non-null primary key `id` and a unique `slug`,
  // so both are generated when not supplied.
  const sanitizedProducts = products.map((p, index) => {
    const row = p as Record<string, unknown>;

    const name = pick(row, ["Product Name", "name", "productName"]) || "Unnamed Product";
    const providedId = pick(row, ["Product ID", "id", "productId"]);
    const category = (pick(row, ["Category", "category"]) || "uncategorized").toLowerCase();

    const weight = parseNumber(pick(row, ["Baseline Weight (g)", "baselineWeight", "weight"]));
    const printHours =
      Number(pick(row, ["Baseline Print Time (hrs)", "baselinePrintTime", "printTime"])) || 0;

    // Pricing: the customer pays the discounted price, and the original
    // selling price is kept as a struck-through label when a discount exists.
    const sellingRaw = pick(row, ["Selling Price", "sellingPrice", "price"]);
    const sellingPrice = parseNumber(sellingRaw);
    const discountedPrice = parseNumber(pick(row, ["Discounted Price", "discountedPrice"]));
    const price = discountedPrice || sellingPrice;
    const hasDiscount = sellingPrice > 0 && price > 0 && sellingPrice > price;
    const priceLabel = hasDiscount
      ? sellingRaw.includes("₹")
        ? sellingRaw
        : `₹${sellingPrice.toFixed(2)}`
      : null;

    // Drop the marketing "Premium " prefix and capitalize, like csv-products.ts
    const shortDescRaw = pick(row, ["Short Description", "description", "shortDescription"]);
    const cleanDesc = shortDescRaw.replace(/^Premium\s+/i, "");
    const description = cleanDesc ? cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1) : "";
    const longDescription = pick(row, ["Long Description", "longDescription", "long_description"]);

    const image =
      pick(row, ["image", "Image"]) ||
      DEFAULT_IMAGE_BY_CATEGORY[category] ||
      "/images/products/organic-sculptures.png";

    const sizeVariant =
      weight >= 250
        ? "120mm x 120mm x 200mm"
        : weight >= 100
        ? "110mm x 110mm x 160mm"
        : "90mm x 90mm x 120mm";

    const pdColumn = Number(pick(row, ["productionDays", "production_days"])) || 0;
    const productionDays =
      printHours > 0 ? Math.max(1, Math.ceil(printHours / 8)) : pdColumn || 5;

    const id = providedId || `prod-${uniqueSuffix}-${index}`;
    const baseSlug = slugify(name) || `product-${uniqueSuffix}-${index}`;
    const slug = makeUniqueSlug(baseSlug, id);

    return {
      id,
      name,
      slug,
      price,
      price_label: priceLabel,
      category,
      description,
      long_description: longDescription,
      materials: toArray(row.materials ?? row.Materials, [
        "Standard PLA",
        "Resin (8K)",
        "Carbon Fiber PETG",
      ]),
      finishes: toArray(row.finishes ?? row.Finishes, ["Matte", "Satin", "Gloss", "Metallic"]),
      dimensions:
        pick(row, ["dimensions", "Dimensions"]) ||
        (category === "trophy" ? "100mm x 100mm x 180mm" : sizeVariant),
      layer_height: pick(row, ["layerHeight", "layer_height"]) || "0.12mm (Detail)",
      infill_density:
        pick(row, ["infillDensity", "infill_density"]) ||
        (category === "trophy" ? "25% Gyroid" : "20% Gyroid"),
      recommended_application:
        pick(row, ["recommendedApplication", "recommended_application"]) ||
        (category === "trophy"
          ? "Award / Recognition / Display"
          : "Devotional / Display / Collectible"),
      production_days: productionDays,
      badge: pick(row, ["badge", "Badge"]) || null,
      is_new: pick(row, ["isNew", "is_new"]).toLowerCase() === "true",
      image,
      images: [image],
    };
  });

  // Collapse duplicate ids within the batch — a repeated primary key makes the
  // upsert throw "ON CONFLICT ... cannot affect row a second time" and fail the
  // entire import. Keep the last occurrence of each id.
  const dedupedById = Array.from(
    new Map(sanitizedProducts.map((p) => [p.id, p])).values()
  );

  const { data, error } = await supabase
    .from("products")
    .upsert(dedupedById, { onConflict: "id" })
    .select();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json(
    {
      success: true,
      count: data?.length || 0,
      received: products.length,
    },
    { status: 201 }
  );
}
