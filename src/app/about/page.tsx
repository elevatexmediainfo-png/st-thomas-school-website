import type { Metadata } from "next";
import { AboutOverviewPage } from "@/components/about-pages";

export const metadata: Metadata = {
  title: "About School | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Learn about the educational approach and school community at St. Thomas English School, Ruabandha, Bhilai., Ruabandha, Bhilai.",
};

export default function AboutPage() {
  return <AboutOverviewPage />;
}
