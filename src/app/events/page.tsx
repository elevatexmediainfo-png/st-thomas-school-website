import type { Metadata } from "next";
import { EventsPage } from "@/components/news-events-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Explore published upcoming and past events for St. Thomas English School, Ruabandha, Bhilai.",
};

export default function EventsRoute() {
  return <EventsPage />;
}
