import type { Metadata } from "next";
import { ClassesPage } from "@/components/academic-pages";

export const metadata: Metadata = {
  title: "Classes | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Explore the editable class-level structure for St. Thomas English School, Ruabandha, Bhilai..",
};

export default function ClassesRoute() {
  return <ClassesPage />;
}
