import { AdminContentModule } from "@/components/admin-content-module";
import { PhaseTwoFeedback, SportsMessageForm } from "@/components/phase-two-management-forms";
import { prisma } from "@/lib/prisma";

export default async function AdminSportsPage({ searchParams }: { searchParams: Promise<{ status?: string; error?: string }> }) {
	const [records, settings, feedback] = await Promise.all([
		prisma.sport.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
		prisma.schoolSetting.findUnique({ where: { id: "school" }, select: { sportsMessageAuthorName: true, sportsMessageAuthorRole: true, sportsMessage: true } }),
		searchParams,
	]);
	return <AdminContentModule model="sports" records={records as unknown as Array<Record<string, unknown>>} extraContent={<section className="admin-message-editor"><div className="admin-section-heading"><h2>Sports Message</h2><p>Displayed on the public Sports page.</p></div><PhaseTwoFeedback status={feedback.status} error={feedback.error} /><SportsMessageForm settings={{ sportsMessageAuthorName: settings?.sportsMessageAuthorName ?? "Michael George", sportsMessageAuthorRole: settings?.sportsMessageAuthorRole ?? "", sportsMessage: settings?.sportsMessage ?? "" }} /></section>} />;
}
