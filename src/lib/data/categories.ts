import { Layers, Wrench, Briefcase, Cpu, Lamp, Gem } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon;
  productCount: number;
}

export const categories: Category[] = [
  { id: "miniatures", name: "Miniatures", slug: "miniatures", icon: Layers, productCount: 2 },
  { id: "custom-parts", name: "Custom Parts", slug: "custom-parts", icon: Wrench, productCount: 3 },
  { id: "edc-gear", name: "EDC Gear", slug: "edc-gear", icon: Briefcase, productCount: 2 },
  { id: "prototypes", name: "Prototypes", slug: "prototypes", icon: Cpu, productCount: 1 },
  { id: "decor", name: "Decor", slug: "decor", icon: Lamp, productCount: 4 },
  { id: "jewelry", name: "Jewelry", slug: "jewelry", icon: Gem, productCount: 0 },
];
