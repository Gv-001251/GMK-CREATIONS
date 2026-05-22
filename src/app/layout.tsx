import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
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
  title: "GMK — 3D CREATIONS | Precision 3D Printing",
  description:
    "Premium 3D printing e-commerce — custom prototypes, miniatures, and intricate art. Precision materiality for your digital concepts.",
  keywords: ["3D printing", "prototypes", "miniatures", "custom prints", "resin", "PLA"],
  openGraph: {
    title: "GMK — 3D CREATIONS",
    description: "Precision materiality for your digital concepts.",
    type: "website",
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
