"use client";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AdminMediaField } from "@/components/admin-media-field";
import { updatePrincipal } from "@/app/admin/phase-two-management-actions";

export type PrincipalInput = {
  principalName: string | null; principalDesignation: string | null; principalMessage: string | null;
  principalPhotoUrl: string | null; principalPhotoKey: string | null; principalPhotoAlt: string | null;
  principalSummary: string | null; principalSortOrder: number; principalStatus: string;
  principalDeskTitle: string | null; version: string;
};
function Save({ uploading }: { uploading: boolean }) {
  const { pending } = useFormStatus();
  return <button className="button button-dark" disabled={pending || uploading}>{uploading ? "Uploading photograph…" : pending ? "Saving…" : "Save Principal information"}</button>;
}
export function PrincipalForm({ settings }: { settings: PrincipalInput }) {
  const [uploading, setUploading] = useState(false);
  return <form className="admin-form" action={updatePrincipal} onSubmit={event => { if (uploading) event.preventDefault(); }}>
    <input type="hidden" name="version" value={settings.version} />
    <div className="admin-form-grid">
      <label>Name<input name="principalName" required maxLength={160} defaultValue={settings.principalName ?? ""} /></label>
      <label>Designation<input name="principalDesignation" required maxLength={160} defaultValue={settings.principalDesignation ?? "I/C Principal"} /></label>
      <label>Principal’s Desk title<input name="principalDeskTitle" maxLength={160} defaultValue={settings.principalDeskTitle ?? ""} /></label>
      <label>Message<textarea name="principalMessage" rows={12} maxLength={12000} defaultValue={settings.principalMessage ?? ""} /></label>
      <label>Short summary<textarea name="principalSummary" rows={3} maxLength={600} defaultValue={settings.principalSummary ?? ""} /></label>
      <label>Display order<input name="principalSortOrder" type="number" required min={0} max={1000000} defaultValue={settings.principalSortOrder} /></label>
      <label>Publishing status<select name="principalStatus" defaultValue={settings.principalStatus}><option>DRAFT</option><option>PUBLISHED</option><option>UNPUBLISHED</option></select></label>
      <AdminMediaField label="Principal photo" urlName="principalPhotoUrl" keyName="principalPhotoKey" altName="principalPhotoAlt" initialUrl={settings.principalPhotoUrl} initialKey={settings.principalPhotoKey} initialAlt={settings.principalPhotoAlt} onBusyChange={setUploading} />
    </div><p className="admin-form-note">A message is required to publish. Draft and unpublished profiles are hidden on every public leadership page. Leave the photo blank to use a neutral placeholder.</p>
    <div className="admin-form-actions"><Save uploading={uploading} /><Link className="button button-outline-dark" href="/admin/leadership">Leadership &amp; Management</Link></div>
  </form>;
}
