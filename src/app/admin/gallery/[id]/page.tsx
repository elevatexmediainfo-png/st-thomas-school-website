import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin-shell";
import { AlbumForm } from "@/components/phase-two-forms";
import { AdminGalleryManager } from "@/components/admin-gallery-manager";
import { PhaseFourFeedback } from "@/components/phase-four-forms";

export default async function GalleryDetailAdmin({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ result?: string; error?: string }> }) {
	const [{ id }, feedback] = await Promise.all([params, searchParams]);
	const album = await prisma.galleryAlbum.findUnique({ where: { id }, include: { photos: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } } });
	if (!album) notFound();
	const images = album.photos.map((photo) => ({ id: photo.id, imageUrl: photo.imageUrl, imageKey: photo.imageKey, altText: photo.altText, caption: photo.caption, sortOrder: photo.sortOrder, status: photo.status }));
	return <AdminShell title={`Gallery: ${album.title}`} description="Manage album details, upload multiple photos, and control what appears on the public gallery.">
		<PhaseFourFeedback result={feedback.result} error={feedback.error} />
		<section className="admin-gallery-summary">
			<div><strong>{album.title}</strong>{album.description && <p>{album.description}</p>}</div>
			<span className={`admin-status-pill is-${album.status.toLowerCase()}`}>{album.status === "PUBLISHED" ? "Published" : album.status === "DRAFT" ? "Draft" : "Unpublished"}</span>
		</section>
		<AlbumForm key={album.coverImageKey ?? album.coverImage ?? "no-cover"} album={album} />
		<div className="admin-section-heading"><h2>Gallery images</h2><p>Images only appear publicly when both the album and the image are published.</p></div>
		<AdminGalleryManager albumId={album.id} initialImages={images} initialCoverKey={album.coverImageKey} />
	</AdminShell>;
}