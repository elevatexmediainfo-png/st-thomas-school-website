import type { Metadata } from "next";
import { DownloadsPage } from "@/components/resource-pages";

export const metadata: Metadata = {
  title: "Downloads | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Browse the editable downloads library for St. Thomas English School, Ruabandha, Bhilai..",
};

export default function DownloadsRoute() {
  return <DownloadsPage />;
}