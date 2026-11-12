"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { AdminMediaField } from "@/components/admin-media-field";
import { saveLeadership } from "@/app/admin/leadership/actions";

type Member = { id: string; fullName: string; designation: string; message: string | null; summary: string | null; sortOrder: number; status: string; photoUrl: string | null; photoKey: string | null; photoAlt: string | null; updatedAt: string };
function Save({ uploading }: { uploading: boolean }) {
  const { pending } = useFormStatus();
  return <button className="button button-dark" disabled={pending || uploading}>{uploading ? "Uploading photograph…" : pending ? "Saving…" : "Save profile"}</button>;
}
export function AdminLeadershipForm({ member, role }: { member?: Member; role?: "CHAIRMAN" | "MANAGER" }) {
  const [uploading, setUploading] = useState(false);
  return <form action={saveLeadership} className="admin-form" onSubmit={event => { if (uploading) event.preventDefault(); }}>
    <input type="hidden" name="id" value={member?.id ?? ""} /><input type="hidden" name="version" value={member?.updatedAt ?? ""} /><input type="hidden" name="systemRole" value={role ?? ""} />
    <div className="admin-form-grid">
      <label>Full name<input name="fullName" required maxLength={160} defaultValue={member?.fullName ?? ""} /></label>
      <label>Designation<input name="designation" required maxLength={160} defaultValue={member?.designation ?? (role === "CHAIRMAN" ? "Chairman" : role === "MANAGER" ? "Co-signatory / Manager" : "")} /></label>
      <label>Full message / vision<textarea name="message" rows={10} maxLength={12000} defaultValue={member?.message ?? ""} /></label>
      <label>Short summary<textarea name="summary" rows={3} maxLength={600} defaultValue={member?.summary ?? ""} /></label>
      <label>Display order<input name="sortOrder" type="number" required min={0} max={1000000} defaultValue={member?.sortOrder ?? (role === "CHAIRMAN" ? 10 : role === "MANAGER" ? 20 : 40)} /></label>
      <label>Publishing status<select name="status" defaultValue={member?.status ?? "DRAFT"}><option>DRAFT</option><option>PUBLISHED</option><option>UNPUBLISHED</option></select></label>
      <AdminMediaField label="Profile photograph" urlName="photoUrl" keyName="photoKey" altName="photoAlt" initialUrl={member?.photoUrl} initialKey={member?.photoKey} initialAlt={member?.photoAlt} onBusyChange={setUploading} placement="Leadership cards and full message" recommendedDimensions="800 × 1000 px" aspectRatio="4:5 portrait" guidance="Clear official portrait" />
    </div><p className="admin-form-note">A full message is required to publish. Published changes appear immediately. Lower display orders appear first.</p><Save uploading={uploading} />
  </form>;
}
