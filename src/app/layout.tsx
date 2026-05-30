import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { ToastContainer } from "@/components/toast";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
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
    url: "https://gmk3d.com",
    siteName: "GMK 3D Creations",
    images: [
      {
        url: "/images/hero-sphere.png",
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
    images: ["/images/hero-sphere.png"],
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
        <AuthProvider>
          <ToastContainer />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
