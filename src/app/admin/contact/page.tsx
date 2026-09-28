import { AdminShell } from "@/components/admin-shell";
import { ContactInformationForm, PhaseFourFeedback } from "@/components/phase-four-forms";
import { prisma } from "@/lib/prisma";

export default async function AdminContactPage({ searchParams }: { searchParams: Promise<{ result?: string; error?: string }> }) {
	const [settings, feedback] = await Promise.all([
		prisma.schoolSetting.findUnique({ where: { id: "school" }, select: { schoolName: true, address: true, phone: true, email: true, mapLink: true, websiteUrl: true, instagramUrl: true, facebookUrl: true, youtubeUrl: true } }),
		searchParams,
	]);
	return <AdminShell title="Contact" description="Edit only contact details confirmed by the school."><PhaseFourFeedback result={feedback.result} error={feedback.error} /><ContactInformationForm settings={settings ?? { schoolName: null, address: null, phone: null, email: null, mapLink: null, websiteUrl: null, instagramUrl: null, facebookUrl: null, youtubeUrl: null }} /></AdminShell>;
}