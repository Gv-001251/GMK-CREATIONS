export interface Product {
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
    id: "cyber-panda",
    name: "Cyber-Panda",
    slug: "cyber-panda",
    description: "High-detail display model.",
    longDescription: "A sleek, cyberpunk-styled panda figurine with metallic blue and chrome accents. Precision printed in 8K resolution resin with intricate geometric armor plating.",
    price: 85.00,
    category: "miniatures",
    image: "/images/products/cyber-panda.png",
    images: ["/images/products/cyber-panda.png"],
    badge: "Popular",
    materials: ["Standard PLA", "Resin (8K)", "Carbon Fiber PETG"],
    finishes: ["Matte", "Satin", "Gloss"],
    dimensions: "80mm x 60mm x 100mm",
    layerHeight: "0.025mm (25 Microns)",
    infillDensity: "100% Solid",
    recommendedApplication: "Display / Collection",
    productionDays: 5,
    featured: true,
  },
  {
    id: "industrial-gears",
    name: "Industrial Gears",
    slug: "industrial-gears",
    description: "Functional structural components.",
    longDescription: "A set of precision-machined interlocking industrial gears. Designed for functional prototyping and mechanical assemblies with tight tolerances.",
    price: 120.00,
    category: "custom-parts",
    image: "/images/products/industrial-gears.png",
    images: ["/images/products/industrial-gears.png"],
    badge: "Functional",
    materials: ["Nylon PA12", "Carbon Fiber PETG", "Resin (8K)"],
    finishes: ["Raw", "Polished", "Anodized"],
    dimensions: "Various (Set of 7)",
    layerHeight: "0.1mm (100 Microns)",
    infillDensity: "80% Grid",
    recommendedApplication: "Mechanical Assembly",
    productionDays: 4,
    featured: true,
  },
  {
    id: "vortex-vase",
    name: "Vortex Vase",
    slug: "vortex-vase",
    description: "Parametric interior decor.",
    longDescription: "A dynamic, algorithmically generated vase structure optimized for SLA printing. Features flowing mathematical curves and a polished translucent finish.",
    price: 65.00,
    category: "decor",
    image: "/images/products/vortex-vase.png",
    images: ["/images/products/vortex-vase.png"],
    materials: ["Standard PLA", "Resin (8K)", "Translucent Resin"],
    finishes: ["Matte", "Gloss", "Translucent"],
    dimensions: "120mm x 120mm x 240mm",
    layerHeight: "0.05mm (50 Microns)",
    infillDensity: "15% Gyroid",
    recommendedApplication: "Interior Decor",
    productionDays: 3,
    featured: true,
  },
  {
    id: "draco-keycaps",
    name: "Draco Keycaps",
    slug: "draco-keycaps",
    description: "Artisan mechanical switch caps.",
    longDescription: "Dragon-head artisan keycaps for mechanical keyboards. Each piece is individually printed in vibrant resin with metallic detailing.",
    price: 45.00,
    category: "edc-gear",
    image: "/images/products/draco-keycaps.png",
    images: ["/images/products/draco-keycaps.png"],
    badge: "New",
    materials: ["Resin (8K)", "UV Resin"],
    finishes: ["Gloss", "Satin", "Metallic"],
    dimensions: "18mm x 18mm x 22mm (each)",
    layerHeight: "0.025mm (25 Microns)",
    infillDensity: "100% Solid",
    recommendedApplication: "Mechanical Keyboard",
    productionDays: 2,
    isNew: true,
  },
  {
    id: "apex-stand",
    name: "Apex Stand",
    slug: "apex-stand",
    description: "Ergonomic workstation elevation.",
    longDescription: "A modern geometric ergonomic laptop and phone stand with angular design. Engineered for optimal screen height and airflow.",
    price: 89.00,
    category: "edc-gear",
    image: "/images/products/apex-stand.png",
    images: ["/images/products/apex-stand.png"],
    materials: ["Standard PLA", "Carbon Fiber PETG", "Nylon PA12"],
    finishes: ["Matte", "Satin", "Textured"],
    dimensions: "300mm x 250mm x 120mm",
    layerHeight: "0.2mm (200 Microns)",
    infillDensity: "40% Honeycomb",
    recommendedApplication: "Workstation",
    productionDays: 3,
  },
  {
    id: "rogue-minis",
    name: "Rogue Minis",
    slug: "rogue-minis",
    description: "Tabletop scale collection (Set of 4).",
    longDescription: "A set of 4 fantasy tabletop miniature figurines in dynamic poses. Warriors, mages, and rogues printed in high-resolution grey resin.",
    price: 35.00,
    category: "miniatures",
    image: "/images/products/rogue-minis.png",
    images: ["/images/products/rogue-minis.png"],
    materials: ["Resin (8K)", "Standard PLA"],
    finishes: ["Raw", "Primed", "Paint-Ready"],
    dimensions: "28mm scale (Set of 4)",
    layerHeight: "0.025mm (25 Microns)",
    infillDensity: "100% Solid",
    recommendedApplication: "Tabletop Gaming",
    productionDays: 3,
  },
  {
    id: "titan-x-drone",
    name: "Titan-X Drone Chassis",
    slug: "titan-x-drone",
    description: "Lightweight aerospace frame.",
    longDescription: "A high-performance racing drone chassis with intricate lattice structure. Engineered for maximum strength-to-weight ratio in carbon fiber reinforced material.",
    price: 145.00,
    category: "custom-parts",
    image: "/images/products/drone-chassis.png",
    images: ["/images/products/drone-chassis.png"],
    materials: ["Carbon Fiber PETG", "Nylon PA12"],
    finishes: ["Raw", "Matte", "Carbon Weave"],
    dimensions: "250mm x 250mm x 45mm",
    layerHeight: "0.15mm (150 Microns)",
    infillDensity: "30% Gyroid",
    recommendedApplication: "FPV Racing",
    productionDays: 4,
  },
  {
    id: "fractal-lamp",
    name: "Fractal Lamp",
    slug: "fractal-lamp",
    description: "Light-diffusing geometric shade.",
    longDescription: "A geometric fractal-pattern table lamp with warm light glowing through intricate mathematical cutout patterns. Creates beautiful shadow projections.",
    price: 110.00,
    category: "decor",
    image: "/images/products/fractal-lamp.png",
    images: ["/images/products/fractal-lamp.png"],
    badge: "Popular",
    materials: ["Standard PLA", "Nylon PA12"],
    finishes: ["Natural White", "Warm Ivory", "Cool Grey"],
    dimensions: "180mm x 180mm x 200mm",
    layerHeight: "0.1mm (100 Microns)",
    infillDensity: "20% Grid",
    recommendedApplication: "Ambient Lighting",
    productionDays: 5,
  },
  {
    id: "organic-sculptures",
    name: "Organic Sculptures",
    slug: "organic-sculptures",
    description: "Algorithmically generated forms.",
    longDescription: "Abstract organic flowing sculptures with undulating mathematical surfaces. Each piece is unique, generated through parametric algorithms.",
    price: 250.00,
    category: "decor",
    image: "/images/products/organic-sculptures.png",
    images: ["/images/products/organic-sculptures.png"],
    materials: ["Resin (8K)", "Standard PLA", "Nylon PA12"],
    finishes: ["Matte", "Satin", "Polished"],
    dimensions: "150mm x 150mm x 200mm",
    layerHeight: "0.05mm (50 Microns)",
    infillDensity: "100% Solid",
    recommendedApplication: "Art Display",
    productionDays: 7,
  },
  {
    id: "architectural-models",
    name: "Architectural Models",
    slug: "architectural-models",
    description: "Custom scale building prototypes.",
    longDescription: "Detailed architectural scale models with precise edges and clean lines. Perfect for client presentations and urban planning visualizations.",
    price: 300.00,
    priceLabel: "From $300",
    category: "prototypes",
    image: "/images/products/architectural-models.png",
    images: ["/images/products/architectural-models.png"],
    materials: ["Standard PLA", "Resin (8K)"],
    finishes: ["Matte White", "Natural", "Painted"],
    dimensions: "Custom (1:50 to 1:200 scale)",
    layerHeight: "0.1mm (100 Microns)",
    infillDensity: "25% Grid",
    recommendedApplication: "Architecture / Presentation",
    productionDays: 10,
  },
  {
    id: "precision-tools",
    name: "Precision Tools",
    slug: "precision-tools",
    description: "Custom jigs and fixtures.",
    longDescription: "Industrial-grade custom jigs, fixtures, and calibration tools. Engineered for precise alignment and repeatable manufacturing processes.",
    price: 55.00,
    category: "custom-parts",
    image: "/images/products/precision-tools.png",
    images: ["/images/products/precision-tools.png"],
    materials: ["Nylon PA12", "Carbon Fiber PETG"],
    finishes: ["Raw", "Matte", "Polished"],
    dimensions: "Various sizes",
    layerHeight: "0.1mm (100 Microns)",
    infillDensity: "60% Grid",
    recommendedApplication: "Manufacturing / QC",
    productionDays: 3,
  },
  {
    id: "bio-chess",
    name: "Bio-mechanical Chess",
    slug: "bio-chess",
    description: "Full tournament set, resin printed.",
    longDescription: "A complete bio-mechanical chess set with ornate, Giger-inspired pieces. Full tournament-size set printed in high-detail dark resin with intricate skeletal details.",
    price: 185.00,
    category: "decor",
    image: "/images/products/bio-chess.png",
    images: ["/images/products/bio-chess.png"],
    materials: ["Resin (8K)"],
    finishes: ["Dark Metallic", "Bone White", "Antique Bronze"],
    dimensions: "Board: 400mm x 400mm, King: 95mm",
    layerHeight: "0.025mm (25 Microns)",
    infillDensity: "100% Solid",
    recommendedApplication: "Display / Gaming",
    productionDays: 8,
  },
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
