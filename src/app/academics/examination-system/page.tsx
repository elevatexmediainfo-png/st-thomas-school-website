import type { Metadata } from "next";
import { ExaminationSystemPage } from "@/components/academic-pages";

export const metadata: Metadata = {
  title: "Examination System | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Explore the editable assessment and examination structure for St. Thomas English School, Ruabandha, Bhilai..",
};

export default function ExaminationSystemRoute() {
  return <ExaminationSystemPage />;
}
