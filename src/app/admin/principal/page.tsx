import { AdminShell } from "@/components/admin-shell";
import { PhaseTwoFeedback, PrincipalForm } from "@/components/phase-two-management-forms";
import { prisma } from "@/lib/prisma";

export default async function AdminPrincipalPage({ searchParams }: { searchParams: Promise<{ status?: string; error?: string }> }) {
	const [settings, feedback] = await Promise.all([
		prisma.schoolSetting.findUnique({ where: { id: "school" } }),
		searchParams,
	]);
	return <AdminShell title="Principal" description="Manage the Principal's name, designation, message, and photo reference.">
		<PhaseTwoFeedback status={feedback.status} error={feedback.error} />
		<PrincipalForm settings={{ principalName: settings?.principalName ?? "Varsha George", principalDesignation: settings?.principalDesignation ?? "I/C Principal", principalMessage: settings?.principalMessage ?? "", principalPhotoUrl: settings?.principalPhotoUrl ?? null, principalPhotoKey: settings?.principalPhotoKey ?? null, principalPhotoAlt: settings?.principalPhotoAlt ?? null }} />
	</AdminShell>;
}