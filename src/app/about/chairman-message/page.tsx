import type { Metadata } from "next";
import { ChairmanMessagePage } from "@/components/about-pages";

export const metadata: Metadata = {
  title: "Chairman's Message | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Read the Chairman or Director's message placeholder for St. Thomas English School, Ruabandha, Bhilai., Ruabandha, Bhilai.",
};

export default function ChairmanMessageRoute() {
  return <ChairmanMessagePage />;
}
