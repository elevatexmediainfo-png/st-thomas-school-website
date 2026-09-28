import type { Metadata } from "next";
import { NewsPage } from "@/components/news-events-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News & Notices | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Published school news from St. Thomas English School, Ruabandha, Bhilai.",
};

export default function NewsRoute() {
  return <NewsPage />;
}
