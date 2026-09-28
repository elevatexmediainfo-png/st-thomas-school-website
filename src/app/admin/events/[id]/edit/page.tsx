import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin-shell";
import { ContentFeedback, EventForm } from "@/components/admin-content-forms";

export default async function EditEventPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ id }, feedback] = await Promise.all([params, searchParams]);
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();
  return <AdminShell title="Edit event" description="Update and publish this event when it is ready."><ContentFeedback error={feedback.error} /><EventForm event={event} /></AdminShell>;
}
