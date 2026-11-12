import type { Metadata } from "next";
import { ChairmanDirectorPage } from "@/components/administration-pages";

export const metadata: Metadata = {
  title: "Chairman / Director | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Chairman or Director profile and message for St. Thomas English School, Ruabandha, Bhilai..",
};

export default function ChairmanDirectorRoute() {
  return <ChairmanDirectorPage />;
}
