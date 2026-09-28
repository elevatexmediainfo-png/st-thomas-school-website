import type { Metadata } from "next";
import { AcademicsOverviewPage } from "@/components/academic-pages";

export const metadata: Metadata = {
  title: "Academics | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Explore the editable academic overview for St. Thomas English School, Ruabandha, Bhilai., Ruabandha, Bhilai.",
};

export default function AcademicsRoute() {
  return <AcademicsOverviewPage />;
}
