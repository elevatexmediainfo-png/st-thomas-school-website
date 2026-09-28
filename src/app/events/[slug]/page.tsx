import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventDetailPage, getPublishedEvent } from "@/components/news-events-pages";

type EventRouteProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: EventRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublishedEvent(slug);
  return { title: event ? `${event.title} | Events` : "Event | St. Thomas English School, Ruabandha, Bhilai.", description: event?.description ?? "Published school event detail." };
}

export default async function EventDetailRoute({ params }: EventRouteProps) {
  const { slug } = await params;
  const event = await getPublishedEvent(slug);
  if (!event) notFound();
  return <EventDetailPage event={event} />;
}
