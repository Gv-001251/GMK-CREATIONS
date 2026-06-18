const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// 1. Load env variables from .env.local manually
const envLocalPath = path.join(__dirname, "../.env.local");
if (!fs.existsSync(envLocalPath)) {
  console.error(".env.local not found!");
  process.exit(1);
}

const envContent = fs.readFileSync(envLocalPath, "utf8");
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[0].split("=")[0].trim();
    let value = match[0].split("=").slice(1).join("=").trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    process.env[key] = value;
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const imagesToUpload = [
  {
    key: "ufo_red",
    filename: "ufo-lamp-red.jpg",
    localPath: "/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/media__1781494963468.jpg",
  },
  {
    key: "ufo_blue",
    filename: "ufo-lamp-blue.jpg",
    localPath: "/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/media__1781494963470.jpg",
  },
  {
    key: "keychain_top",
    filename: "dharani-keychain-top.jpg",
    localPath: "/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/media__1781494963510.jpg",
  },
  {
    key: "keychain_tilted",
    filename: "dharani-keychain-tilted.jpg",
    localPath: "/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/media__1781494963533.jpg",
  },
  {
    key: "nameplate",
    filename: "mk-materials-nameplate.jpg",
    localPath: "/Users/lateshk/.gemini/antigravity-ide/brain/d666d69b-7a96-4219-8446-64a423f5b933/media__1781494963550.jpg",
  },
];

async function run() {
  try {
    // 2. Ensure product-images bucket exists and is public
    console.log("Checking storage buckets...");
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) throw bucketsError;

    const hasProductImagesBucket = buckets.some((b) => b.id === "product-images");
    if (!hasProductImagesBucket) {
      console.log("Creating public 'product-images' bucket...");
      const { error: createBucketError } = await supabase.storage.createBucket("product-images", {
        public: true,
      });
      if (createBucketError) throw createBucketError;
    }

    // 3. Upload images
    const uploadedUrls = {};
    for (const img of imagesToUpload) {
      if (!fs.existsSync(img.localPath)) {
        throw new Error(`Image not found locally at: ${img.localPath}`);
      }

      console.log(`Uploading ${img.filename}...`);
      const fileBuffer = fs.readFileSync(img.localPath);
      const storagePath = `${Date.now()}-${img.filename}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(storagePath, fileBuffer, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(storagePath);

      uploadedUrls[img.key] = publicUrl;
      console.log(`Uploaded! Public URL: ${publicUrl}`);
    }

    // 4. Delete existing products
    console.log("Cleaning up existing products in Supabase...");
    const { error: deleteError } = await supabase.from("products").delete().neq("id", "");
    if (deleteError) throw deleteError;

    // 5. Seed new products
    console.log("Inserting new products into database...");
    const newProducts = [
      {
        id: "prod-001",
        name: "Alien UFO Lamp",
        slug: "alien-ufo-lamp",
        description: "Extraterrestrial desk lamp featuring an alien in the tractor beam chamber with remote-controlled RGB LEDs.",
        long_description: "Bring outer space to your room with this beautifully 3D printed Alien UFO Lamp. Inside the tractor beam chamber is a detailed grey alien figure. The UFO base and top feature glowing LED lights controlled by an included wireless remote, allowing you to cycle through colors (red, blue, green, etc.) or set dynamic color-changing patterns.",
        price: 49.99,
        category: "decor",
        image: uploadedUrls.ufo_red,
        images: [uploadedUrls.ufo_red, uploadedUrls.ufo_blue],
        materials: ["PLA", "PETG"],
        finishes: ["Gloss", "Matte"],
        dimensions: "140mm x 140mm x 180mm",
        layer_height: "0.16mm (Detail)",
        infill_density: "15% Gyroid",
        recommended_application: "Ambient Lighting / Desk decor",
        production_days: 3,
        featured: true,
        is_new: true,
      },
      {
        id: "prod-002",
        name: "Dharani Keychain",
        slug: "dharani-keychain",
        description: "Custom dual-color personalized name keychain.",
        long_description: "A custom-made personalized 3D printed keychain featuring the name 'Dharani'. Crafted using a dual-color extrusion process with a solid purple base and embossed white text. Extremely durable, lightweight, and perfect for keys, backpacks, or gifts.",
        price: 5.99,
        category: "edc-gear",
        image: uploadedUrls.keychain_top,
        images: [uploadedUrls.keychain_top, uploadedUrls.keychain_tilted],
        materials: ["PLA"],
        finishes: ["Matte"],
        dimensions: "85mm x 25mm x 4mm",
        layer_height: "0.2mm (Standard)",
        infill_density: "100% Solid",
        recommended_application: "Personal Accessories",
        production_days: 1,
        featured: true,
        is_new: true,
      },
      {
        id: "prod-003",
        name: "Desk Nameplate - M.K. Building Materials",
        slug: "mk-building-materials-nameplate",
        description: "Professional custom dual-color desk nameplate.",
        long_description: "A bespoke desk nameplate printed in dual-color PLA. Perfect for offices and professional counters, featuring high-contrast white text embossed on a sleek matte black backing. Displays 'M. K. BUILDING MATERIALS' and contact info.",
        price: 19.99,
        category: "decor",
        image: uploadedUrls.nameplate,
        images: [uploadedUrls.nameplate],
        materials: ["PLA"],
        finishes: ["Matte"],
        dimensions: "200mm x 50mm x 40mm",
        layer_height: "0.2mm",
        infill_density: "20% Grid",
        recommended_application: "Office / Corporate Desk Display",
        production_days: 2,
        featured: true,
        is_new: true,
      },
    ];

    const { error: insertError } = await supabase.from("products").insert(newProducts);
    if (insertError) throw insertError;
    console.log("Seeded database successfully!");

    // 6. Overwrite src/lib/data/products.ts with new static arrays
    console.log("Updating static products file: src/lib/data/products.ts...");
    const productsFilePath = path.join(__dirname, "../src/lib/data/products.ts");

    const staticProductsContent = `export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  price: number;
  priceLabel?: string;
  category: string;
  image: string;
  images: string[];
  badge?: string;
  materials: string[];
  finishes: string[];
  dimensions: string;
  layerHeight: string;
  infillDensity: string;
  recommendedApplication: string;
  productionDays: number;
  featured?: boolean;
  isNew?: boolean;
}

export const products: Product[] = [
  {
    id: "prod-001",
    name: "Alien UFO Lamp",
    slug: "alien-ufo-lamp",
    description: "Extraterrestrial desk lamp featuring an alien in the tractor beam chamber with remote-controlled RGB LEDs.",
    longDescription: "Bring outer space to your room with this beautifully 3D printed Alien UFO Lamp. Inside the tractor beam chamber is a detailed grey alien figure. The UFO base and top feature glowing LED lights controlled by an included wireless remote, allowing you to cycle through colors (red, blue, green, etc.) or set dynamic color-changing patterns.",
    price: 49.99,
    category: "decor",
    image: "${uploadedUrls.ufo_red}",
    images: ["${uploadedUrls.ufo_red}", "${uploadedUrls.ufo_blue}"],
    badge: "New",
    materials: ["PLA", "PETG"],
    finishes: ["Gloss", "Matte"],
    dimensions: "140mm x 140mm x 180mm",
    layerHeight: "0.16mm (Detail)",
    infillDensity: "15% Gyroid",
    recommendedApplication: "Ambient Lighting / Desk decor",
    productionDays: 3,
    featured: true,
    isNew: true,
  },
  {
    id: "prod-002",
    name: "Dharani Keychain",
    slug: "dharani-keychain",
    description: "Custom dual-color personalized name keychain.",
    longDescription: "A custom-made personalized 3D printed keychain featuring the name 'Dharani'. Crafted using a dual-color extrusion process with a solid purple base and embossed white text. Extremely durable, lightweight, and perfect for keys, backpacks, or gifts.",
    price: 5.99,
    category: "edc-gear",
    image: "${uploadedUrls.keychain_top}",
    images: ["${uploadedUrls.keychain_top}", "${uploadedUrls.keychain_tilted}"],
    badge: "Customizable",
    materials: ["PLA"],
    finishes: ["Matte"],
    dimensions: "85mm x 25mm x 4mm",
    layerHeight: "0.2mm (Standard)",
    infillDensity: "100% Solid",
    recommendedApplication: "Personal Accessories",
    productionDays: 1,
    featured: true,
    isNew: true,
  },
  {
    id: "prod-003",
    name: "Desk Nameplate - M.K. Building Materials",
    slug: "mk-building-materials-nameplate",
    description: "Professional custom dual-color desk nameplate.",
    longDescription: "A bespoke desk nameplate printed in dual-color PLA. Perfect for offices and professional counters, featuring high-contrast white text embossed on a sleek matte black backing. Displays 'M. K. BUILDING MATERIALS' and contact info.",
    price: 19.99,
    category: "decor",
    image: "${uploadedUrls.nameplate}",
    images: ["${uploadedUrls.nameplate}"],
    badge: "Office",
    materials: ["PLA"],
    finishes: ["Matte"],
    dimensions: "200mm x 50mm x 40mm",
    layerHeight: "0.2mm",
    infillDensity: "20% Grid",
    recommendedApplication: "Office / Corporate Desk Display",
    productionDays: 2,
    featured: true,
    isNew: true,
  }
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return products;
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getRecommendedProducts(excludeId?: string): Product[] {
  return products
    .filter((p) => p.id !== excludeId)
    .slice(0, 4);
}
`;

    fs.writeFileSync(productsFilePath, staticProductsContent, "utf8");
    console.log("Static file updated successfully!");
    console.log("All tasks completed successfully!");
  } catch (error) {
    console.error("Error running seed script:", error);
    process.exit(1);
  }
}

run();
