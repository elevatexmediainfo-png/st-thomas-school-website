import { AdminShell } from "@/components/admin-shell";
import { ContentFeedback, EventForm } from "@/components/admin-content-forms";

export default async function NewEventPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AdminShell title="Add event" description="Create an event that can be reviewed before publication."><ContentFeedback error={error} /><EventForm /></AdminShell>;
}
