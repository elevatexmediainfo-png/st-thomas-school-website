import Link from "next/link";
import { AdminShell, AdminTableEmpty } from "@/components/admin-shell";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { AdminLeadershipForm } from "@/components/admin-leadership-form";
import { requireLeadershipAdmin } from "@/lib/leadership-admin";
import { prisma } from "@/lib/prisma";
import { deleteLeadership } from "./actions";

export default async function LeadershipAdmin({ searchParams }: { searchParams: Promise<{ edit?: string; setup?: string; status?: string; error?: string }> }) {
  await requireLeadershipAdmin();
  const query = await searchParams;
  const [members, principal] = await Promise.all([prisma.leadershipMember.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }), prisma.schoolSetting.findUnique({ where: { id: "school" } })]);
  const selected = members.find(member => member.id === query.edit);
  const setup = query.setup === "CHAIRMAN" || query.setup === "MANAGER" ? query.setup : undefined;
  return <AdminShell title="Leadership & Management" description="Manage default positions and additional leadership profiles.">
    {query.error && <p role="alert" className="admin-feedback error">{query.error}</p>}{query.status && <p role="status" className="admin-feedback success">Changes saved.</p>}
    <section className="admin-form"><h2>Principal</h2><p>{principal?.principalName || "Principal profile"} · {principal?.principalStatus ?? "Not configured"}</p><Link href="/admin/principal">Edit existing Principal profile</Link></section>
    <div className="admin-quick-actions">{(["CHAIRMAN", "MANAGER"] as const).filter(role => !members.some(member => member.systemRole === role)).map(role => <Link key={role} className="button button-outline-dark" href={`/admin/leadership?setup=${role}`}>Set up {role === "CHAIRMAN" ? "Chairman" : "Co-signatory / Manager"}</Link>)}</div>
    {selected ? <><h2>Edit {selected.fullName}</h2><AdminLeadershipForm key={selected.id + selected.updatedAt.toISOString()} member={{ ...selected, updatedAt: selected.updatedAt.toISOString() }} /></> : query.edit ? <p role="alert">Profile not found.</p> : setup ? <><h2>Set up default position</h2><AdminLeadershipForm key={setup} role={setup} /></> : null}
    <details className="admin-form-disclosure"><summary>Add additional leadership member</summary><AdminLeadershipForm /></details>
    {members.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name / designation</th><th>Order</th><th>Publishing</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{members.map(member => <tr key={member.id}><td><strong>{member.fullName || "Name pending"}</strong><small>{member.designation}</small></td><td>{member.sortOrder}</td><td>{member.status}</td><td>{member.updatedAt.toLocaleDateString("en-IN")}</td><td><Link href={`/admin/leadership?edit=${member.id}`}>Edit</Link>{!member.systemRole && <AdminDeleteButton action={deleteLeadership} id={member.id} label={member.fullName} version={member.updatedAt.toISOString()} />}</td></tr>)}</tbody></table></div> : <AdminTableEmpty message="Set up a default position or add a custom leadership member." />}
  </AdminShell>;
}
