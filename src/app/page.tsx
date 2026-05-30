import { Metadata } from "next";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "Home",
  description: "GMK 3D Creations is your premier destination for high-quality custom 3D printed models, prototypes, and art.",
};

export default function Page() {
  return <HomeClient />;
}
