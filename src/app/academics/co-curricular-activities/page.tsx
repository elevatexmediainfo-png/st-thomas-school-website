import type { Metadata } from "next";
import { CoCurricularPage } from "@/components/academic-pages";

export const metadata: Metadata = {
  title: "Co-curricular Activities | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Explore editable co-curricular activity categories for St. Thomas English School, Ruabandha, Bhilai..",
};

export default function CoCurricularRoute() {
  return <CoCurricularPage />;
}
