import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminShell, AdminTableEmpty } from "@/components/admin-shell";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { deleteGalleryAlbum } from "@/app/admin/phase-two-actions";
import { PhaseFourFeedback } from "@/components/phase-four-forms";

export default async function AdminGalleryPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; result?: string; error?: string }> }) {
	const filters = await searchParams;
	const records = await prisma.galleryAlbum.findMany({ include: { photos: true }, orderBy: [{ albumDate: "desc" }, { createdAt: "desc" }] });
	const query = filters.q?.trim().toLocaleLowerCase() ?? "";
	const albums = records.filter((album) => (!query || `${album.title} ${album.category} ${album.description ?? ""}`.toLocaleLowerCase().includes(query)) && (!filters.status || album.status === filters.status));
	return <AdminShell title="Gallery" description="Manage gallery albums, captions, and publication. Image storage can be connected later."><PhaseFourFeedback result={filters.result} error={filters.error} /><form className="admin-filter-form" action="/admin/gallery"><input name="q" placeholder="Search albums" aria-label="Search albums" defaultValue={filters.q ?? ""} /><select name="status" aria-label="Filter albums by publication" defaultValue={filters.status ?? ""}><option value="">All publishing states</option><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="UNPUBLISHED">Unpublished</option></select><button className="button button-dark">Search / filter</button><Link className="button button-outline-dark" href="/admin/gallery">Clear</Link></form><div className="admin-toolbar"><p>{albums.length} albums</p><Link className="button button-dark" href="/admin/gallery/new">Create album</Link></div>{albums.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Album</th><th>Gallery items</th><th>Publishing</th><th>Actions</th></tr></thead><tbody>{albums.map((album) => <tr key={album.id}><td><strong>{album.title}</strong><small>{album.category} · {album.albumDate?.toLocaleDateString() ?? "Date not set"}</small></td><td>{album.photos.length} items</td><td>{album.status}</td><td><div className="admin-row-actions"><Link href={`/admin/gallery/${album.id}`}>Manage</Link><AdminDeleteButton action={deleteGalleryAlbum} id={album.id} label={album.title} /></div></td></tr>)}</tbody></table></div> : <AdminTableEmpty message="No gallery albums have been added. Add school-provided album details; images may remain blank." />}</AdminShell>;
}
