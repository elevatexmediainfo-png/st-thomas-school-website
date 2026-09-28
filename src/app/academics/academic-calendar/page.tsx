import type { Metadata } from "next";
import { AcademicCalendarPage } from "@/components/academic-pages";

export const metadata: Metadata = {
  title: "Academic Calendar | St. Thomas English School, Ruabandha, Bhilai.",
  description: "View the placeholder academic calendar structure for St. Thomas English School, Ruabandha, Bhilai..",
};

export default function AcademicCalendarRoute() {
  return <AcademicCalendarPage />;
}
