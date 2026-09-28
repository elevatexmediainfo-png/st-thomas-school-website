import Link from "next/link";
import { AdminMediaField } from "@/components/admin-media-field";
import {
	saveAchievement,
	saveContactInformation,
	saveGalleryItem,
	updateAdmissions,
} from "@/app/admin/phase-four-actions";

type AchievementInput = { id: string; title: string; category: string; studentName: string | null; year: number | null; achievementDate: Date | null; description: string | null; imageUrl: string | null; imageKey: string | null; imageAlt: string | null; status: string };
type GalleryItemInput = { id: string; caption: string | null; sortOrder: number; imageUrl: string | null; imageKey: string | null; altText: string | null; status: string };
type AdmissionInput = { headline: string | null; introduction: string | null; admissionProcess: unknown; eligibility: string | null; requiredDocuments: unknown; startDate: Date | null; endDate: Date | null; availableClasses: unknown; importantInstructions: unknown; isPublished: boolean };
type ContactInput = { schoolName: string | null; address: string | null; phone: string | null; email: string | null; mapLink: string | null; websiteUrl: string | null; instagramUrl: string | null; facebookUrl: string | null; youtubeUrl: string | null };

function linesValue(value: unknown) {
	return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string").join("\n") : "";
}

function Publication({ status }: { status?: string }) {
	return <label>Publishing status<select name="status" defaultValue={status ?? "DRAFT"}><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="UNPUBLISHED">Unpublished</option></select></label>;
}

export function PhaseFourFeedback({ result, error }: { result?: string; error?: string }) {
	const results: Record<string, string> = { created: "Item added successfully.", updated: "Changes saved successfully.", deleted: "Item deleted successfully.", saved: "Information saved successfully." };
	const errors: Record<string, string> = { required: "Complete the required fields.", invalid: "Check the provided values and try again.", dates: "Check the date range. The end date must not come before the start date.", email: "Enter a valid email address.", mapLink: "Enter a valid HTTPS Google Maps URL.", "album-not-found": "The selected gallery album could not be found.", "duplicate-slug": "This album address is already in use. Choose a different slug." };
	if (result && results[result]) return <p className="admin-feedback success" role="status">{results[result]}</p>;
	if (error && errors[error]) return <p className="admin-feedback error" role="alert">{errors[error]}</p>;
	if (error?.endsWith("Url")) return <p className="admin-feedback error" role="alert">Enter a valid HTTPS URL for this link.</p>;
	return null;
}

export function AchievementForm({ achievement }: { achievement?: AchievementInput }) {
	return <form className="admin-form" action={saveAchievement}>
		<input type="hidden" name="id" value={achievement?.id ?? ""} />
		<div className="admin-form-grid">
			<label>Title<input name="title" required maxLength={200} defaultValue={achievement?.title ?? ""} /></label>
			<label>Category<select name="category" defaultValue={achievement?.category ?? "Academic"}>{["Academic", "Sports", "Cultural", "Awards", "Other"].map((category) => <option key={category}>{category}</option>)}</select></label>
			<label>Student / person name (optional)<input name="studentName" maxLength={160} defaultValue={achievement?.studentName ?? ""} /></label>
			<label>Year<input name="year" type="number" min={1900} max={2200} defaultValue={achievement?.year ?? ""} /></label>
			<label>Date (optional)<input name="achievementDate" type="date" defaultValue={achievement?.achievementDate?.toISOString().slice(0, 10) ?? ""} /></label>
			<label>Description<textarea name="description" rows={5} defaultValue={achievement?.description ?? ""} /></label>
		</div>
		<AdminMediaField label="Achievement photo" urlName="imageUrl" keyName="imageKey" altName="imageAlt" initialUrl={achievement?.imageUrl} initialKey={achievement?.imageKey} initialAlt={achievement?.imageAlt} />
		<Publication status={achievement?.status} />
		<div className="admin-form-actions"><button className="button button-dark">{achievement ? "Save changes" : "Add achievement"}</button><Link className="button button-outline-dark" href="/admin/achievements">Cancel</Link></div>
	</form>;
}

export function GalleryItemForm({ albumId, item }: { albumId: string; item?: GalleryItemInput }) {
	return <form className="admin-form" action={saveGalleryItem}>
		<input type="hidden" name="albumId" value={albumId} />
		<input type="hidden" name="id" value={item?.id ?? ""} />
		<div className="admin-form-grid">
			<label>Caption (optional)<input name="caption" maxLength={240} defaultValue={item?.caption ?? ""} /></label>
			<label>Display order<input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} /></label>
		</div>
		<AdminMediaField label="Gallery image" urlName="imageUrl" keyName="imageKey" altName="altText" initialUrl={item?.imageUrl} initialKey={item?.imageKey} initialAlt={item?.altText} />
		<Publication status={item?.status} />
		<div className="admin-form-actions"><button className="button button-dark">{item ? "Save gallery item" : "Add gallery item"}</button><Link className="button button-outline-dark" href={`/admin/gallery/${albumId}`}>Cancel</Link></div>
	</form>;
}

export function EnquiryStatusForm({ id, status }: { id: string; status: string }) {
	const current = status === "IN_PROGRESS" ? "CONTACTED" : status;
	return <form className="admin-status-form" action={setStatusAction}><input type="hidden" name="id" value={id} /><select name="status" aria-label="Enquiry status" defaultValue={current}><option value="NEW">New</option><option value="CONTACTED">Contacted</option><option value="CLOSED">Closed</option></select><button className="button button-outline-dark">Save status</button></form>;
}

import { setEnquiryStatus as setStatusAction } from "@/app/admin/phase-four-actions";
export { removeEnquiry } from "@/app/admin/phase-four-actions";

export function AdmissionSettingsForm({ settings }: { settings: AdmissionInput }) {
	return <form className="admin-form" action={updateAdmissions}>
		<div className="admin-form-grid">
			<label>Admission headline<input name="headline" maxLength={200} defaultValue={settings.headline ?? ""} /></label>
			<label>Introduction<textarea name="introduction" rows={4} defaultValue={settings.introduction ?? ""} /></label>
			<label>Admission process (one step per line)<textarea name="admissionProcess" rows={5} defaultValue={linesValue(settings.admissionProcess)} /></label>
			<label>Eligibility information<textarea name="eligibility" rows={4} defaultValue={settings.eligibility ?? ""} /></label>
			<label>Required documents (one per line)<textarea name="requiredDocuments" rows={4} defaultValue={linesValue(settings.requiredDocuments)} /></label>
			<label>Available classes (one per line)<textarea name="availableClasses" rows={3} defaultValue={linesValue(settings.availableClasses)} /></label>
			<label>Start date<input name="startDate" type="date" defaultValue={settings.startDate?.toISOString().slice(0, 10) ?? ""} /></label>
			<label>End date<input name="endDate" type="date" defaultValue={settings.endDate?.toISOString().slice(0, 10) ?? ""} /></label>
			<label>Important dates/instructions (one per line)<textarea name="importantInstructions" rows={4} defaultValue={linesValue(settings.importantInstructions)} /></label>
		</div>
		<label className="admin-checkboxes"><input type="checkbox" name="published" defaultChecked={settings.isPublished} /> Published on public Admissions page</label>
		<div className="admin-form-actions"><button className="button button-dark">Save Admissions information</button><Link className="button button-outline-dark" href="/admin">Cancel</Link></div>
	</form>;
}

export function ContactInformationForm({ settings }: { settings: ContactInput }) {
	return <form className="admin-form" action={saveContactInformation}>
		<div className="admin-form-grid">
			<label>School name<input name="schoolName" maxLength={200} defaultValue={settings.schoolName ?? ""} /></label>
			<label>Address<textarea name="address" rows={3} defaultValue={settings.address ?? ""} /></label>
			<label>Phone<input name="phone" type="tel" defaultValue={settings.phone ?? ""} /></label>
			<label>Email<input name="email" type="email" defaultValue={settings.email ?? ""} /></label>
			<label>Google Maps URL<input name="mapLink" type="url" defaultValue={settings.mapLink ?? ""} /></label>
			<label>Website URL<input name="websiteUrl" type="url" defaultValue={settings.websiteUrl ?? ""} /></label>
			<label>Instagram URL<input name="instagramUrl" type="url" defaultValue={settings.instagramUrl ?? ""} /></label>
			<label>Facebook URL<input name="facebookUrl" type="url" defaultValue={settings.facebookUrl ?? ""} /></label>
			<label>YouTube URL<input name="youtubeUrl" type="url" defaultValue={settings.youtubeUrl ?? ""} /></label>
		</div>
		<div className="admin-form-actions"><button className="button button-dark">Save contact information</button><Link className="button button-outline-dark" href="/admin">Cancel</Link></div>
	</form>;
}