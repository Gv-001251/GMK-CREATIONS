export interface Material {
  id: string;
  name: string;
  shortName: string;
  properties: string[];
  priceMultiplier: number;
  density: number;       // g/cm³
  costPerGram: number;   // INR per gram
}

export const materials: Material[] = [
  {
    id: "pla",
    name: "PLA (Polylactic Acid)",
    shortName: "PLA",
    properties: ["Biodegradable", "Easy to print", "Wide color range"],
    priceMultiplier: 1.0,
    density: 1.24,       // g/cm³
    costPerGram: 5.0,    // ₹5 per gram
  },
  {
    id: "tpu",
    name: "TBU (Thermoplastic Polyurethane)",
    shortName: "TBU",
    properties: ["Flexible", "Shock-absorbing", "Durable"],
    priceMultiplier: 1.6,
    density: 1.21,       // g/cm³
    costPerGram: 8.0,    // ₹8 per gram
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
