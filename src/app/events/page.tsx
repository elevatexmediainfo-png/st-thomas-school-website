import type { Metadata } from "next";
import { EventsPage } from "@/components/news-events-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Explore published upcoming and past events for St. Thomas English School, Ruabandha, Bhilai.",
};

type EventsSearchParams = Promise<{ q?: string | string[]; category?: string | string[] }>;

const firstValue = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value) ?? "";

export default async function EventsRoute({ searchParams }: { searchParams: EventsSearchParams }) {
  const { q, category } = await searchParams;
  return <EventsPage query={firstValue(q).slice(0, 100)} category={firstValue(category).slice(0, 60)} />;
}
