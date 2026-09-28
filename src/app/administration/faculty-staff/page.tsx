import type { Metadata } from "next";
import { FacultyStaffPage } from "@/components/administration-pages";

export const metadata: Metadata = {
  title: "Faculty & Staff | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Editable faculty and staff directory placeholders for St. Thomas English School, Ruabandha, Bhilai..",
};

export default function FacultyStaffRoute() {
  return <FacultyStaffPage />;
}
