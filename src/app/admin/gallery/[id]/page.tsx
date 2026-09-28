import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminShell, AdminTableEmpty } from "@/components/admin-shell";
import { AlbumForm } from "@/components/phase-two-forms";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { deleteGalleryItem, saveGalleryItem } from "@/app/admin/phase-four-actions";
import { GalleryItemForm, PhaseFourFeedback } from "@/components/phase-four-forms";

export default async function GalleryDetailAdmin({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ result?: string; error?: string }> }) {
	const [{ id }, feedback] = await Promise.all([params, searchParams]);
	const album = await prisma.galleryAlbum.findUnique({ where: { id }, include: { photos: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } } });
	if (!album) notFound();
	return <AdminShell title={`Gallery: ${album.title}`} description="Manage album details and captioned gallery placeholders."><PhaseFourFeedback result={feedback.result} error={feedback.error} /><AlbumForm album={album} /><div className="admin-section-heading"><h2>Gallery items</h2><p>Photos remain blank.</p></div><GalleryItemForm albumId={album.id} />{album.photos.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Image</th><th>Item details</th><th>Actions</th></tr></thead><tbody>{album.photos.map((photo) => <tr key={photo.id}><td>Photo placeholder</td><td><form className="admin-inline-form" action={saveGalleryItem}><input type="hidden" name="id" value={photo.id} /><input type="hidden" name="albumId" value={album.id} /><label>Caption<input name="caption" defaultValue={photo.caption ?? ""} /></label><label>Order<input name="sortOrder" type="number" defaultValue={photo.sortOrder} /></label><label>Publishing<select name="status" defaultValue={photo.status}><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="UNPUBLISHED">Unpublished</option></select></label><button className="button button-outline-dark">Save changes</button></form></td><td><AdminDeleteButton action={deleteGalleryItem} id={photo.id} label={photo.caption || "this gallery item"} model={album.id} /></td></tr>)}</tbody></table></div> : <AdminTableEmpty message="No gallery items have been added. Add a captioned placeholder now or wait until approved photos are available." />}</AdminShell>;
}
