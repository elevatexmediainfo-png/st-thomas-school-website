import Link from "next/link";
import { AdminShell, AdminTableEmpty } from "@/components/admin-shell";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { FacilityForm, PhaseTwoFeedback } from "@/components/phase-two-management-forms";
import { deleteFacility } from "@/app/admin/phase-two-management-actions";
import { prisma } from "@/lib/prisma";

export default async function AdminFacilitiesPage({ searchParams }: { searchParams: Promise<{ q?: string; edit?: string; status?: string; error?: string }> }) {
	const filters = await searchParams;
	const allFacilities = await prisma.facility.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
	const query = filters.q?.trim().toLocaleLowerCase() ?? "";
	const facilities = allFacilities.filter((facility) => !query || `${facility.name} ${facility.category} ${facility.description ?? ""}`.toLocaleLowerCase().includes(query));
	const selected = filters.edit ? allFacilities.find((facility) => facility.id === filters.edit) : undefined;

	return <AdminShell title="Campus Facilities" description="Manage the school's published facilities and descriptions.">
		<PhaseTwoFeedback status={filters.status} error={filters.error} />
		{filters.edit && (selected ? <><div className="admin-section-heading"><h2>Edit Facility</h2><Link href="/admin/facilities">Close editor</Link></div><FacilityForm facility={selected} /></> : <p className="admin-feedback error" role="alert">That facility could not be found.</p>)}
		<details className="admin-form-disclosure"><summary>Add Facility</summary><FacilityForm /></details>
		<form className="admin-filter-form" action="/admin/facilities"><input name="q" placeholder="Search facilities" aria-label="Search facilities" defaultValue={filters.q ?? ""} /><button className="button button-dark" type="submit">Search</button><Link className="button button-outline-dark" href="/admin/facilities">Clear</Link></form>
		<div className="admin-toolbar"><p>Showing {facilities.length} of {allFacilities.length} facilities</p></div>
		{facilities.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Facility</th><th>Description</th><th>Publishing</th><th>Actions</th></tr></thead><tbody>{facilities.map((facility) => <tr key={facility.id}><td><strong>{facility.name}</strong><small>{facility.category}</small></td><td>{facility.description || "No description provided"}</td><td><span className={`admin-status ${facility.status.toLowerCase()}`}>{facility.status}</span></td><td><div className="admin-row-actions"><Link href={`/admin/facilities?edit=${encodeURIComponent(facility.id)}`}>Edit</Link><AdminDeleteButton action={deleteFacility} id={facility.id} label={facility.name} /></div></td></tr>)}</tbody></table></div> : <AdminTableEmpty message="No facilities match this search." />}
	</AdminShell>;
}
