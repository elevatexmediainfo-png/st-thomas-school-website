import { AdminShell } from "@/components/admin-shell";
import { NoticeForm } from "@/components/admin-content-forms";
import { ContentFeedback } from "@/components/admin-content-forms";

export default async function NewNewsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
	const feedback = await searchParams;
	return <AdminShell title="Add news" description="Enter school-provided news for review and publication."><ContentFeedback error={feedback.error} /><NoticeForm type="NEWS" /></AdminShell>;
}