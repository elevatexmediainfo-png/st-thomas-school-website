import Link from "next/link";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { AdminShell, AdminTableEmpty } from "@/components/admin-shell";
import { ContentFeedback } from "@/components/admin-content-forms";
import { deleteNotice } from "@/app/admin/admin-actions";
import { prisma } from "@/lib/prisma";

export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; status?: string; error?: string; result?: string }> }) {
	const filters = await searchParams;
	const allNews = await prisma.notice.findMany({ where: { type: "NEWS" }, orderBy: [{ publishDate: "desc" }, { createdAt: "desc" }] });
	const query = filters.q?.trim().toLocaleLowerCase() ?? "";
	const news = allNews.filter((item) => {
		const searchable = `${item.title} ${item.description ?? ""} ${item.content ?? ""}`.toLocaleLowerCase();
		return (!query || searchable.includes(query)) && (!filters.category || item.category === filters.category) && (!filters.status || item.status === filters.status);
	});
	const categories = [...new Set(allNews.map((item) => item.category))].sort();

	return <AdminShell title="News" description="Write, review, and publish official school news.">
		<ContentFeedback status={filters.result} error={filters.error} />
		<div className="admin-toolbar"><p>{news.length} matching news items</p><Link className="button button-dark" href="/admin/news/new">Add news <span aria-hidden="true">+</span></Link></div>
		<form className="admin-filter-form" action="/admin/news"><input name="q" placeholder="Search news" aria-label="Search news" defaultValue={filters.q ?? ""} /><select name="category" aria-label="Filter news by category" defaultValue={filters.category ?? ""}><option value="">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select><select name="status" aria-label="Filter news by publication" defaultValue={filters.status ?? ""}><option value="">All publishing states</option><option value="PUBLISHED">Published</option><option value="DRAFT">Unpublished</option><option value="UNPUBLISHED">Unpublished</option></select><button className="button button-dark" type="submit">Search / filter</button><Link className="button button-outline-dark" href="/admin/news">Clear</Link></form>
		<div className="admin-toolbar"><p>Showing {news.length} of {allNews.length} news items</p></div>
		{news.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>News</th><th>Category</th><th>Date</th><th>Publishing</th><th>Actions</th></tr></thead><tbody>{news.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>{item.description || "No short description"}</small></td><td>{item.category}</td><td>{item.publishDate?.toLocaleDateString() ?? "Date not set"}</td><td><span className={`admin-status ${item.status.toLowerCase()}`}>{item.status}</span></td><td><div className="admin-row-actions"><Link href={`/admin/news/${item.id}/edit`}>Edit</Link><AdminDeleteButton action={deleteNotice} id={item.id} label={item.title} /></div></td></tr>)}</tbody></table></div> : <AdminTableEmpty message="No news items have been added. Add school-provided content when it is ready." />}
	</AdminShell>;
}
