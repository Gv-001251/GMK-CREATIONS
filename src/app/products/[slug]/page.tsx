import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductDetailClient from "./product-detail-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("name, description, image")
    .eq("slug", slug)
    .single();

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | GMK 3D Creations`,
      description: product.description,
      images: [
        {
          url: product.image || "/images/logo.jpeg",
          width: 800,
          height: 600,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [product.image || "/images/logo.jpeg"],
    },
  };
}

export default function Page() {
  return <ProductDetailClient />;
}
