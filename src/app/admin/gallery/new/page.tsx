import { AdminShell } from "@/components/admin-shell";
import { AlbumForm } from "@/components/phase-two-forms";
import { PhaseFourFeedback } from "@/components/phase-four-forms";

export default async function NewGalleryPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
	const { error } = await searchParams;
	return <AdminShell title="Create album"><PhaseFourFeedback error={error} /><AlbumForm /></AdminShell>;
}
