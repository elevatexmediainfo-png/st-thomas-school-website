import type { Metadata } from "next";
import { ManagementPage } from "@/components/administration-pages";

export const metadata: Metadata = {
  title: "School Management | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Explore the editable school management structure for St. Thomas English School, Ruabandha, Bhilai..",
};

export default function ManagementRoute() {
  return <ManagementPage />;
}
