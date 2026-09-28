import type { Metadata } from "next";
import { TeachingMethodologyPage } from "@/components/academic-pages";

export const metadata: Metadata = {
  title: "Teaching Methodology | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Explore the editable teaching methodology framework for St. Thomas English School, Ruabandha, Bhilai..",
};

export default function TeachingMethodologyRoute() {
  return <TeachingMethodologyPage />;
}
