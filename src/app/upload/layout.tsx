import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload 3D Model | GMK 3D Creations",
  description: "Upload your 3D model files (STL, OBJ, 3MF, STEP) for custom printing.",
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
