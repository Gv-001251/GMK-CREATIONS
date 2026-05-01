export interface Material {
  id: string;
  name: string;
  shortName: string;
  properties: string[];
  priceMultiplier: number;
}

export const materials: Material[] = [
  {
    id: "standard-pla",
    name: "Standard PLA",
    shortName: "PLA",
    properties: ["Biodegradable", "Easy to print", "Wide color range"],
    priceMultiplier: 1.0,
  },
  {
    id: "resin-8k",
    name: "Resin (8K)",
    shortName: "8K Resin",
    properties: ["Ultra-high detail", "Smooth surface", "Brittle"],
    priceMultiplier: 1.8,
  },
  {
    id: "carbon-fiber-petg",
    name: "Carbon Fiber PETG",
    shortName: "CF-PETG",
    properties: ["High strength", "Lightweight", "Heat resistant"],
    priceMultiplier: 2.2,
  },
  {
    id: "nylon-pa12",
    name: "Nylon PA12",
    shortName: "PA12",
    properties: ["Flexible", "Durable", "Chemical resistant"],
    priceMultiplier: 2.5,
  },
];

export const finishes = [
  { id: "matte", name: "Matte", description: "Smooth, non-reflective surface" },
  { id: "satin", name: "Satin", description: "Subtle sheen, semi-gloss" },
  { id: "gloss", name: "Gloss", description: "High-shine polished surface" },
  { id: "raw", name: "Raw", description: "Unfinished, showing layer lines" },
  { id: "metallic", name: "Metallic", description: "Chrome-like reflective coating" },
  { id: "translucent", name: "Translucent", description: "Light-diffusing semi-transparent" },
];
