import type { Metadata } from "next";
import { PrincipalAdministrationPage } from "@/components/administration-pages";

export const metadata: Metadata = {
  title: "Principal | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Principal profile placeholder for St. Thomas English School, Ruabandha, Bhilai., Ruabandha, Bhilai.",
};

export default function PrincipalRoute() {
  return <PrincipalAdministrationPage />;
}
