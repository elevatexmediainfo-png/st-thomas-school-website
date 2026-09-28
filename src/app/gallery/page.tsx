import type { Metadata } from "next";
import { GalleryPage } from "@/components/gallery-pages";

export const metadata: Metadata = {
  title: "Gallery | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Explore the editable gallery album structure for St. Thomas English School, Ruabandha, Bhilai..",
};

export default function GalleryRoute() {
  return <GalleryPage />;
}
