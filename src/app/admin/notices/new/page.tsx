import { AdminShell } from "@/components/admin-shell";
import { ContentFeedback, NoticeForm } from "@/components/admin-content-forms";

export default async function NewNoticePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const feedback = await searchParams;
  return <AdminShell title="Add notice" description="Create a notice that can be reviewed before publication."><ContentFeedback error={feedback.error} /><NoticeForm type="NOTICE" /></AdminShell>;
}
