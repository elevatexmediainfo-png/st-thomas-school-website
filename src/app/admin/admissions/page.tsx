import { AdminShell } from "@/components/admin-shell";
import { AdmissionSettingsForm, PhaseFourFeedback } from "@/components/phase-four-forms";
import { prisma } from "@/lib/prisma";

export default async function AdminAdmissionsPage({ searchParams }: { searchParams: Promise<{ result?: string; error?: string }> }) {
	const [settings, feedback] = await Promise.all([
		prisma.admissionSetting.findUnique({ where: { id: "admissions" } }),
		searchParams,
	]);
	return <AdminShell title="Admissions" description="Manage school-provided admission information. Leave unknown details blank."><PhaseFourFeedback result={feedback.result} error={feedback.error} /><AdmissionSettingsForm settings={{ headline: settings?.headline ?? null, introduction: settings?.introduction ?? null, admissionProcess: settings?.admissionProcess ?? null, eligibility: settings?.eligibility ?? null, requiredDocuments: settings?.requiredDocuments ?? null, startDate: settings?.startDate ?? null, endDate: settings?.endDate ?? null, availableClasses: settings?.availableClasses ?? null, importantInstructions: settings?.importantInstructions ?? null, isPublished: settings?.isPublished ?? false }} /></AdminShell>;
}
