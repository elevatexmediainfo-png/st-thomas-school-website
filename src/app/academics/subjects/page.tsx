import type { Metadata } from "next";
import { SubjectsPage } from "@/components/academic-pages";

export const metadata: Metadata = {
  title: "Subjects | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Explore editable subject categories for St. Thomas English School, Ruabandha, Bhilai..",
};

export default function SubjectsRoute() {
  return <SubjectsPage />;
}
