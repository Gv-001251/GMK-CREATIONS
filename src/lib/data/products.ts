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
  layerHeight: string;
  infillDensity: string;
  recommendedApplication: string;
  productionDays: number;
  featured?: boolean;
  isNew?: boolean;
  isDualColor?: boolean;
}

import { csvProducts } from "./csv-products";

export const products: Product[] = [
  {
    id: "prod-001",
    name: "Alien UFO Lamp",
    slug: "alien-ufo-lamp",
    description: "Extraterrestrial desk lamp featuring an alien in the tractor beam chamber with remote-controlled RGB LEDs.",
    longDescription: "Bring outer space to your room with this beautifully 3D printed Alien UFO Lamp. Inside the tractor beam chamber is a detailed grey alien figure. The UFO base and top feature glowing LED lights controlled by an included wireless remote, allowing you to cycle through colors (red, blue, green, etc.) or set dynamic color-changing patterns.",
    price: 1600.00,
    category: "decor",
    image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781495281579-ufo-lamp-red.jpg",
    images: [
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781495281579-ufo-lamp-red.jpg",
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781495282347-ufo-lamp-blue.jpg",
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496974899-ufo-lamp-green-1.jpg",
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496976559-ufo-lamp-green-2.jpg"
    ],
    badge: "New",
    materials: ["Standard PLA", "Carbon Fiber PETG", "Translucent Resin"],
    finishes: ["Gloss", "Matte", "Satin"],
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
    price: 60.00,
    category: "edc-gear",
    image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781495282936-dharani-keychain-top.jpg",
    images: ["https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781495282936-dharani-keychain-top.jpg", "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781495283564-dharani-keychain-tilted.jpg"],
    badge: "Customizable",
    materials: ["Standard PLA", "Carbon Fiber PETG", "Nylon PA12"],
    finishes: ["Matte", "Satin", "Gloss"],
    layerHeight: "0.2mm (Standard)",
    infillDensity: "100% Solid",
    recommendedApplication: "Personal Accessories",
    productionDays: 1,
    featured: true,
    isNew: true,
    isDualColor: true,
  },
  {
    id: "prod-003",
    name: "Desk Nameplate - M.K. Building Materials",
    slug: "mk-building-materials-nameplate",
    description: "Professional custom dual-color desk nameplate.",
    longDescription: "A bespoke desk nameplate printed in dual-color PLA. Perfect for offices and professional counters, featuring high-contrast white text embossed on a sleek matte black backing. Displays 'M. K. BUILDING MATERIALS' and contact info.",
    price: 600.00,
    category: "decor",
    image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781495284181-mk-materials-nameplate.jpg",
    images: ["https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781495284181-mk-materials-nameplate.jpg", "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496310071-mk-nameplate-printbed.jpg", "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496308757-mk-nameplate-held.jpg"],
    badge: "Office",
    materials: ["Standard PLA", "Carbon Fiber PETG", "Nylon PA12"],
    finishes: ["Matte", "Satin", "Gloss"],
    layerHeight: "0.2mm",
    infillDensity: "20% Grid",
    recommendedApplication: "Office / Corporate Desk Display",
    productionDays: 2,
    featured: true,
    isNew: true,
    isDualColor: true,
  },
  {
    id: "prod-004",
    name: "3D Photo Lithophane",
    slug: "3d-photo-lithophane",
    description: "Custom 3D printed photo lithophane with desktop stand — your photos brought to life in light.",
    longDescription: "Turn your favourite photos into stunning 3D printed lithophanes. When backlit, the varying thickness of the translucent PLA reveals a beautifully detailed greyscale image. Each lithophane comes with an integrated desktop stand for easy display. Perfect for gifts, memorials, or home décor. Simply upload your photo and we handle the rest — from image processing to precision printing.",
    price: 1300.00,
    category: "decor",
    image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496311799-lithophane-front.jpg",
    images: ["https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496311799-lithophane-front.jpg", "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496312464-lithophane-angle2.jpg", "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496314697-lithophane-angle3.jpg", "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496631006-lithophane-backlit-1.jpg", "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496632421-lithophane-backlit-2.jpg", "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496634059-lithophane-backlit-3.jpg"],
    badge: "Customizable",
    materials: ["Standard PLA", "Translucent Resin"],
    finishes: ["Raw", "Matte"],
    layerHeight: "0.12mm (Ultra-Detail)",
    infillDensity: "100% Solid",
    recommendedApplication: "Gifts / Home Décor / Memorials",
    productionDays: 3,
    featured: true,
    isNew: true,
  },
  {
    id: "prod-005",
    name: "Shiva Lingam on Lotus Pedestal",
    slug: "shiva-lingam-lotus-pedestal",
    description: "Intricately detailed 3D printed Shiva Lingam with lotus motif on a classic pillar pedestal, finished in antique gold.",
    longDescription: "A beautifully crafted miniature Shiva Lingam set within a leaf-shaped surround featuring an ornate lotus motif, mounted on a classical pillar and stepped base. 3D printed in PLA and hand-finished with a premium antique gold spray, giving it the appearance of a traditional brass idol. Perfect for puja rooms, office desks, or as a devotional gift.",
    price: 100.00,
    category: "decor",
    image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496641008-shiva-lingam-gold.jpg",
    images: ["https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496641008-shiva-lingam-gold.jpg"],
    badge: "Devotional",
    materials: ["Standard PLA", "Resin (8K)", "UV Resin"],
    finishes: ["Metallic", "Matte", "Gloss"],
    layerHeight: "0.12mm (Ultra-Detail)",
    infillDensity: "30% Gyroid",
    recommendedApplication: "Puja / Home Décor / Devotional Gifts",
    productionDays: 2,
    featured: true,
    isNew: true,
  },
  {
    id: "prod-006",
    name: "Miniature VR Developer Desk Set",
    slug: "miniature-vr-developer-desk-set",
    description: "Highly detailed 3D printed miniature desk set featuring a developer wearing a VR headset.",
    longDescription: "A perfect desk companion for programmers, tech enthusiasts, and VR lovers. This miniature set features a detailed figure wearing a virtual reality headset sitting behind a desk, along with a separate detailed miniature office table. 3D printed with high precision to capture micro-details.",
    price: 1000.00,
    category: "miniatures",
    image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496978571-vr-developer-desk-set.jpg",
    images: [
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496978571-vr-developer-desk-set.jpg",
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497347653-vr-developer-double-desk.jpg",
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497349436-vr-developer-figurine-profile.jpg",
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497350056-vr-developer-figurine-threequarter.jpg"
    ],
    badge: "New",
    materials: ["Standard PLA", "Resin (8K)", "UV Resin"],
    finishes: ["Matte", "Satin", "Paint-Ready"],
    layerHeight: "0.12mm (Ultra-Detail)",
    infillDensity: "20% Gyroid",
    recommendedApplication: "Desk accessory / Geeky collectible / Miniature diorama",
    productionDays: 2,
    featured: true,
    isNew: true,
  },
  {
    id: "prod-007",
    name: "Articulated Robot Figure",
    slug: "articulated-robot-figure",
    description: "Poseable articulated miniature robot model with moveable joints.",
    longDescription: "An adorable 3D printed articulated robot figure. Featuring moveable limbs and a retro design with a small antenna on its head. Printed as a single piece with integrated joints (print-in-place), this robot is fully poseable and fun to play with. Great as a fidget toy, desk buddy, or decorative miniature.",
    price: 500.00,
    category: "miniatures",
    image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496984839-miniature-robot-grey.jpg",
    images: [
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496984839-miniature-robot-grey.jpg"
    ],
    badge: "Fidget Toy",
    materials: ["Standard PLA", "Carbon Fiber PETG"],
    finishes: ["Matte", "Satin", "Gloss"],
    layerHeight: "0.16mm (Detail)",
    infillDensity: "15% Grid",
    recommendedApplication: "Fidget toy / Desk decoration / Gift",
    productionDays: 2,
    featured: true,
    isNew: true,
  },
  {
    id: "prod-008",
    name: "Elephant Desk Organizer & Pen Holder",
    slug: "elephant-desk-organizer-pen-holder",
    description: "Charming elephant desk organizer and pen holder printed in premium bronze-gold PLA.",
    longDescription: "Keep your workspace tidy and delightful with this 3D printed Elephant Pen Holder and Desk Organizer. Featuring a cute baby elephant sitting on a wooden barrel connected to a hollow log/cup for holding pens, pencils, rulers, or brushes. Printed in a rich, shiny bronze-gold finish, this desk buddy is both highly functional and decorative.",
    price: 3200.00,
    category: "decor",
    image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497198776-elephant-organizer-front-1.jpg",
    images: [
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497198776-elephant-organizer-front-1.jpg",
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497199305-elephant-organizer-front-2.jpg",
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497197371-elephant-organizer-back.jpg"
    ],
    badge: "Desk Organizer",
    materials: ["Standard PLA", "Carbon Fiber PETG"],
    finishes: ["Metallic", "Matte", "Satin"],
    layerHeight: "0.16mm (Detail)",
    infillDensity: "20% Gyroid",
    recommendedApplication: "Office desks / Kids rooms / Art studio organizer",
    productionDays: 3,
    featured: true,
    isNew: true,
  },
  {
    id: "prod-009",
    name: "Sudarshana Chakra Devotional Replica",
    slug: "sudarshana-chakra-devotional-replica",
    description: "Ornate 3D printed replica of the Sudarshana Chakra on a display stand, finished in a serene light blue.",
    longDescription: "A beautifully detailed, symmetrical 3D printed replica of the Sudarshana Chakra, the divine disc weapon of Lord Vishnu. Featuring intricate star patterns and decorative leaf structures on the outer rim, complete with an elegant circular pedestal stand. Finished in a calm pastel blue, it makes for a wonderful devotional accent piece in home altars, offices, or living rooms.",
    price: 1250.00,
    category: "decor",
    image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497199773-sudarshana-chakra-display.jpg",
    images: [
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497199773-sudarshana-chakra-display.jpg"
    ],
    badge: "Devotional",
    materials: ["Standard PLA", "Resin (8K)"],
    finishes: ["Matte", "Satin", "Metallic"],
    layerHeight: "0.16mm (Detail)",
    infillDensity: "15% Grid",
    recommendedApplication: "Puja Room / Spiritual Home Decor / Sacred Gift",
    productionDays: 2,
    featured: true,
    isNew: true,
  },
  {
    id: "prod-010",
    name: "Mandala Flower Decorative Tile",
    slug: "mandala-flower-decorative-tile",
    description: "3D printed geometric mandala flower wall plaque/tile in vibrant blue.",
    longDescription: "Add a touch of geometric elegance to your walls or shelves with this 3D printed Mandala Flower Tile. Inspired by classical architectural stone carvings, this decorative tile features layered petals radiating from a central grid pattern, creating a beautiful depth effect. Printed in a vibrant solid blue, it can be mounted on walls, displayed on stands, or used in creative layouts.",
    price: 2100.00,
    category: "decor",
    image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497200571-mandala-flower-tile.jpg",
    images: [
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497200571-mandala-flower-tile.jpg"
    ],
    badge: "Wall Decor",
    materials: ["Standard PLA", "Carbon Fiber PETG"],
    finishes: ["Matte", "Satin", "Gloss"],
    layerHeight: "0.2mm (Standard)",
    infillDensity: "15% Grid",
    recommendedApplication: "Wall Art / Display Stand Decor / Shelf Accent",
    productionDays: 2,
    featured: true,
    isNew: true,
  },
  {
    id: "prod-011",
    name: "Prabhavali Ornate Archway Model",
    slug: "prabhavali-ornate-archway-model",
    description: "Exquisitely detailed 3D printed Prabhavali (divine archway) model finished in premium glossy purple.",
    longDescription: "A stunning Prabhavali replica, representing the traditional ornamental arch placed behind deity idols in Hindu temples. Featuring the Kirtimukha (monster-mask protector deity motif) at the crown, flanked by detailed floral scrolls and pillars. 3D printed with extreme detail and finished in a vibrant, glossy purple, it serves as a beautiful backdrop for home shrines or a unique mantle accent.",
    price: 1400.00,
    category: "decor",
    image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497350577-prabhavali-archway-main.jpg",
    images: [
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497350577-prabhavali-archway-main.jpg",
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781497348761-prabhavali-archway-held.jpg"
    ],
    badge: "Devotional",
    materials: ["Standard PLA", "Resin (8K)"],
    finishes: ["Gloss", "Matte", "Satin"],
    layerHeight: "0.12mm (Ultra-Detail)",
    infillDensity: "20% Grid",
    recommendedApplication: "Home Altar / Puja Mandir Backdrop / Spiritual Decor",
    productionDays: 2,
    featured: true,
    isNew: true,
  },
  {
    id: "prod-012",
    name: "Miniature Office Desk",
    slug: "miniature-office-desk",
    description: "Sleek 3D printed miniature blue office desk/table model.",
    longDescription: "A clean and minimalist 3D printed miniature office desk. Perfect as a standalone desk model for dioramas, miniature scenes, or as a cute decoration. Featuring a light-blue textured top surface and grey legs.",
    price: 100.00,
    category: "miniatures",
    image: "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496980110-vr-developer-desk-angle.jpg",
    images: [
      "https://jqwyqactuygxezqizwic.supabase.co/storage/v1/object/public/product-images/1781496980110-vr-developer-desk-angle.jpg"
    ],
    badge: "Miniature",
    materials: ["Standard PLA", "Carbon Fiber PETG", "Nylon PA12"],
    finishes: ["Matte", "Satin", "Gloss"],
    layerHeight: "0.16mm (Detail)",
    infillDensity: "15% Grid",
    recommendedApplication: "Miniature scenes / Diorama accessories",
    productionDays: 1,
    featured: true,
    isNew: true,
    isDualColor: true,
  }
  ,
  ...csvProducts,
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
