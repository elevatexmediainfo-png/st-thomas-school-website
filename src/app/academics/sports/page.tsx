import type { Metadata } from "next";
import { SportsPage } from "@/components/academic-pages";

export const metadata: Metadata = {
  title: "Sports | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Explore the editable sports and physical education framework for St. Thomas English School, Ruabandha, Bhilai..",
};

export default function SportsRoute() {
  return <SportsPage />;
}
