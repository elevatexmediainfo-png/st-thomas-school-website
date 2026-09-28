import Link from "next/link";
import { AdminShell, AdminTableEmpty } from "@/components/admin-shell";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { FacultyForm, PhaseTwoFeedback } from "@/components/phase-two-management-forms";
import { deleteFaculty } from "@/app/admin/phase-two-management-actions";
import { prisma } from "@/lib/prisma";

export default async function AdminFacultyPage({ searchParams }: { searchParams: Promise<{ q?: string; department?: string; designation?: string; edit?: string; status?: string; error?: string }> }) {
	const filters = await searchParams;
	const allMembers = await prisma.facultyMember.findMany({ orderBy: [{ sortOrder: "asc" }, { fullName: "asc" }] });
	const query = filters.q?.trim().toLocaleLowerCase() ?? "";
	const members = allMembers.filter((member) => {
		const searchable = [member.fullName, member.designation, member.subject, member.department, member.qualification].filter(Boolean).join(" ").toLocaleLowerCase();
		return (!query || searchable.includes(query)) && (!filters.department || member.department === filters.department) && (!filters.designation || member.designation === filters.designation);
	});
	const departments = [...new Set(allMembers.map((member) => member.department).filter((value): value is string => Boolean(value)))].sort();
	const designations = [...new Set(allMembers.map((member) => member.designation))].sort();
	const selected = filters.edit ? allMembers.find((member) => member.id === filters.edit) : undefined;

	return <AdminShell title="Faculty & Staff" description="Manage the school directory. Contact numbers are not collected.">
		<PhaseTwoFeedback status={filters.status} error={filters.error} />
		{filters.edit && (selected ? <><div className="admin-section-heading"><h2>Edit Faculty / Staff</h2><Link href="/admin/faculty">Close editor</Link></div><FacultyForm member={selected} /></> : <p className="admin-feedback error" role="alert">That staff record could not be found.</p>)}
		<details className="admin-form-disclosure"><summary>Add Faculty / Staff</summary><FacultyForm /></details>
		<form className="admin-filter-form" action="/admin/faculty"><input name="q" placeholder="Search name, subject or qualification" aria-label="Search Faculty & Staff" defaultValue={filters.q ?? ""} /><select name="department" aria-label="Filter by department" defaultValue={filters.department ?? ""}><option value="">All departments</option>{departments.map((department) => <option key={department}>{department}</option>)}</select><select name="designation" aria-label="Filter by designation" defaultValue={filters.designation ?? ""}><option value="">All designations</option>{designations.map((designation) => <option key={designation}>{designation}</option>)}</select><button className="button button-dark" type="submit">Search / filter</button><Link className="button button-outline-dark" href="/admin/faculty">Clear</Link></form>
		<div className="admin-toolbar"><p>Showing {members.length} of {allMembers.length} Faculty / Staff records</p></div>
		{members.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Designation</th><th>Subject / Department</th><th>Qualification</th><th>Publishing</th><th>Actions</th></tr></thead><tbody>{members.map((member) => <tr key={member.id}><td><strong>{member.fullName}</strong><small>{member.category.replaceAll("_", " ")}</small></td><td>{member.designation}</td><td>{[member.subject, member.department].filter(Boolean).join(" · ") || "Not provided"}</td><td>{member.qualification || "Not provided"}</td><td><span className={`admin-status ${member.status.toLowerCase()}`}>{member.status}</span></td><td><div className="admin-row-actions"><Link href={`/admin/faculty?edit=${encodeURIComponent(member.id)}`}>Edit</Link><AdminDeleteButton action={deleteFaculty} id={member.id} label={member.fullName} /></div></td></tr>)}</tbody></table></div> : <AdminTableEmpty message="No Faculty / Staff records match these filters." />}
	</AdminShell>;
}
