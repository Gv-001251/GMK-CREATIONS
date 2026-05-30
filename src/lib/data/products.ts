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

export const products: Product[] = [];


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
