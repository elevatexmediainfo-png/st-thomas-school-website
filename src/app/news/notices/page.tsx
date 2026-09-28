import type { Metadata } from "next";
import { NoticesPage } from "@/components/news-events-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notices | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Browse the editable notice board and archive for St. Thomas English School, Ruabandha, Bhilai..",
};

export default function NoticesRoute() {
  return <NoticesPage />;
}
