import Link from "next/link";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { AdminShell, AdminTableEmpty } from "@/components/admin-shell";
import { AchievementForm, PhaseFourFeedback } from "@/components/phase-four-forms";
import { deleteAchievement } from "@/app/admin/phase-four-actions";
import { prisma } from "@/lib/prisma";

export default async function AdminAchievementsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; status?: string; edit?: string; result?: string; error?: string }> }) {
	const filters = await searchParams;
	const allItems = await prisma.achievement.findMany({ orderBy: [{ achievementDate: "desc" }, { createdAt: "desc" }] });
	const query = filters.q?.trim().toLocaleLowerCase() ?? "";
	const items = allItems.filter((item) => `${item.title} ${item.studentName ?? ""} ${item.description ?? ""}`.toLocaleLowerCase().includes(query) && (!filters.category || item.category === filters.category) && (!filters.status || item.status === filters.status));
	const selected = filters.edit ? allItems.find((item) => item.id === filters.edit) : undefined;
	const categories = [...new Set(allItems.map((item) => item.category))].sort();
	return <AdminShell title="Achievements" description="Manage school-provided achievement records.">
		<PhaseFourFeedback result={filters.result} error={filters.error} />
		{filters.edit && (selected ? <><div className="admin-section-heading"><h2>Edit achievement</h2><Link href="/admin/achievements">Close editor</Link></div><AchievementForm achievement={selected} /></> : <p className="admin-feedback error" role="alert">Achievement record not found.</p>)}
		<details className="admin-form-disclosure"><summary>Add achievement</summary><AchievementForm /></details>
		<form className="admin-filter-form" action="/admin/achievements"><input name="q" placeholder="Search achievements" aria-label="Search achievements" defaultValue={filters.q ?? ""} /><select name="category" aria-label="Filter by category" defaultValue={filters.category ?? ""}><option value="">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select><select name="status" aria-label="Filter by publishing status" defaultValue={filters.status ?? ""}><option value="">All publishing states</option><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option></select><button className="button button-dark">Search / filter</button><Link className="button button-outline-dark" href="/admin/achievements">Clear</Link></form>
		<div className="admin-toolbar"><p>Showing {items.length} of {allItems.length} achievements</p></div>
		{items.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Achievement</th><th>Category</th><th>Person</th><th>Date</th><th>Publishing</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>{item.description ?? "No description"}</small></td><td>{item.category}</td><td>{item.studentName ?? "Not provided"}</td><td>{item.achievementDate?.toLocaleDateString() ?? item.year ?? "Not provided"}</td><td><span className={`admin-status ${item.status.toLowerCase()}`}>{item.status}</span></td><td><div className="admin-row-actions"><Link href={`/admin/achievements?edit=${encodeURIComponent(item.id)}`}>Edit</Link><AdminDeleteButton action={deleteAchievement} id={item.id} label={item.title} /></div></td></tr>)}</tbody></table></div> : <AdminTableEmpty message="No achievements have been added. Add only school-confirmed achievements." />}
	</AdminShell>;
}