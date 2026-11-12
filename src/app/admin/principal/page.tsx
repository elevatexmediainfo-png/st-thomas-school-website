import { AdminShell } from "@/components/admin-shell";
import { PhaseTwoFeedback } from "@/components/phase-two-management-forms";
import { PrincipalForm } from "@/components/admin-principal-form";
import { requireLeadershipAdmin } from "@/lib/leadership-admin";
import { prisma } from "@/lib/prisma";

export default async function AdminPrincipalPage({ searchParams }: { searchParams: Promise<{ status?: string; error?: string }> }) {
	await requireLeadershipAdmin();
	const [settings, feedback] = await Promise.all([
		prisma.schoolSetting.findUnique({ where: { id: "school" } }),
		searchParams,
	]);
	return <AdminShell title="Principal" description="Manage the Principal's name, designation, message, and photo reference.">
		<PhaseTwoFeedback status={feedback.status} error={feedback.error} />
		<PrincipalForm key={settings?.updatedAt.toISOString() ?? "new"} settings={{ principalName: settings?.principalName ?? "Varsha George", principalDesignation: settings?.principalDesignation ?? "I/C Principal", principalMessage: settings?.principalMessage ?? "", principalPhotoUrl: settings?.principalPhotoUrl ?? null, principalPhotoKey: settings?.principalPhotoKey ?? null, principalPhotoAlt: settings?.principalPhotoAlt ?? null, principalSummary: settings?.principalSummary ?? null, principalStatus: settings?.principalStatus ?? "PUBLISHED", principalSortOrder: settings?.principalSortOrder ?? 30, principalDeskTitle: settings?.principalDeskTitle ?? null, version: settings?.updatedAt.toISOString() ?? "new" }} />
	</AdminShell>;
}
