import type { Metadata } from "next";
import { FacilitiesPage } from "@/components/academic-pages";

export const metadata: Metadata = {
  title: "Campus Facilities | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Explore campus facilities at St. Thomas English School, Ruabandha, Bhilai..",
};

export default function FacilitiesRoute() {
  return <FacilitiesPage />;
}
