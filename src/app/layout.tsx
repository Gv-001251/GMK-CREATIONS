import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { ClientProviders } from "@/components/client-providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.gmk3dcreations.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | GMK 3D Creations",
    default: "GMK 3D Creations | Premium 3D Printing & Custom Models",
  },
  description:
    "Premium 3D printing e-commerce — custom prototypes, miniatures, and intricate art. Precision materiality for your digital concepts.",
  keywords: ["3D printing", "prototypes", "miniatures", "custom prints", "resin", "PLA"],
  openGraph: {
    title: "GMK 3D Creations",
    description: "Premium 3D printing e-commerce. Precision materiality for your digital concepts.",
    url: SITE_URL,
    siteName: "GMK 3D Creations",
    images: [
      {
        url: "/images/logo.jpeg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GMK 3D Creations",
    description: "Premium 3D printing e-commerce.",
    images: ["/images/logo.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${manrope.variable} antialiased`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
