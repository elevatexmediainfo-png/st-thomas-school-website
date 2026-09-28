import type { Metadata } from "next";
import { CurriculumPage } from "@/components/academic-pages";

export const metadata: Metadata = {
  title: "Curriculum | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Learn about the editable curriculum approach for St. Thomas English School, Ruabandha, Bhilai..",
};

export default function CurriculumRoute() {
  return <CurriculumPage />;
}
