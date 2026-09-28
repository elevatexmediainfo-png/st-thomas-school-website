import type { Metadata } from "next";
import { PrincipalMessagePage } from "@/components/about-pages";

export const metadata: Metadata = {
  title: "Principal's Message | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Read the Principal's message placeholder for St. Thomas English School, Ruabandha, Bhilai., Ruabandha, Bhilai.",
};

export default function PrincipalMessageRoute() {
  return <PrincipalMessagePage />;
}
