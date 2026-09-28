import type { Metadata } from "next";
import { AdministrationOverviewPage } from "@/components/administration-pages";

export const metadata: Metadata = {
  title: "Administration | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Learn about the generic, editable administration structure of St. Thomas English School, Ruabandha, Bhilai..",
};

export default function AdministrationRoute() {
  return <AdministrationOverviewPage />;
}
