import Link from "next/link";
import { AdminMediaField } from "@/components/admin-media-field";
import {
	saveFaculty,
	saveFacility,
	updateSportsMessage,
} from "@/app/admin/phase-two-management-actions";

type FacultyInput = {
	id: string;
	fullName: string;
	designation: string;
	department: string | null;
	subject: string | null;
	qualification: string | null;
	photoUrl: string | null;
	photoKey: string | null;
	photoAlt: string | null;
	category: string;
	status: string;
};

type FacilityInput = {
	id: string;
	name: string;
	category: string;
	description: string | null;
	imageUrl: string | null;
	imageKey: string | null;
	imageAlt: string | null;
	status: string;
};


type SportsMessageInput = {
	sportsMessageAuthorName: string | null;
	sportsMessageAuthorRole: string | null;
	sportsMessage: string | null;
};

const facultyCategories = [
	["TEACHING_FACULTY", "Teaching faculty"],
	["ACADEMIC_COORDINATOR", "Academic coordinator"],
	["ADMINISTRATIVE_STAFF", "Administrative staff"],
	["SUPPORT_STAFF", "Support staff"],
];

function PublicationSelect({ value }: { value?: string }) {
	return <label>Publishing status<select name="status" defaultValue={value ?? "PUBLISHED"}><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="UNPUBLISHED">Unpublished</option></select></label>;
}

export function FacultyForm({ member }: { member?: FacultyInput }) {
	return <form className="admin-form" action={saveFaculty}>
		<input type="hidden" name="id" value={member?.id ?? ""} />
		<div className="admin-form-grid">
			<label>Full name<input name="fullName" required maxLength={160} defaultValue={member?.fullName ?? ""} /></label>
			<label>Designation<input name="designation" required maxLength={160} defaultValue={member?.designation ?? ""} /></label>
			<label>Subject<input name="subject" maxLength={160} defaultValue={member?.subject ?? ""} /></label>
			<label>Department<input name="department" maxLength={160} defaultValue={member?.department ?? ""} /></label>
			<label>Qualification<input name="qualification" maxLength={240} defaultValue={member?.qualification ?? ""} /></label>
			<label>Staff group<select name="category" required defaultValue={member?.category ?? "TEACHING_FACULTY"}>{facultyCategories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
			<AdminMediaField label="Faculty photo" urlName="photoUrl" keyName="photoKey" altName="photoAlt" initialUrl={member?.photoUrl} initialKey={member?.photoKey} initialAlt={member?.photoAlt} />
			<PublicationSelect value={member?.status} />
		</div>
		<p className="admin-form-note">Mobile and phone fields are not collected. Photos may be left blank.</p>
		<div className="admin-form-actions"><button className="button button-dark" type="submit">{member ? "Save changes" : "Add faculty / staff"}</button><Link className="button button-outline-dark" href="/admin/faculty">Cancel</Link></div>
	</form>;
}

export function FacilityForm({ facility }: { facility?: FacilityInput }) {
	return <form className="admin-form" action={saveFacility}>
		<input type="hidden" name="id" value={facility?.id ?? ""} />
		<input type="hidden" name="category" value={facility?.category ?? ""} />
		<div className="admin-form-grid">
			<label>Facility name<input name="name" required maxLength={160} defaultValue={facility?.name ?? ""} /></label>
			<label>Description<textarea name="description" rows={5} defaultValue={facility?.description ?? ""} /></label>
			<AdminMediaField label="Facility photo" urlName="imageUrl" keyName="imageKey" altName="imageAlt" initialUrl={facility?.imageUrl} initialKey={facility?.imageKey} initialAlt={facility?.imageAlt} />
			<PublicationSelect value={facility?.status} />
		</div>
		<p className="admin-form-note">Photos may be left blank. Draft and unpublished facilities are hidden from the public page.</p>
		<div className="admin-form-actions"><button className="button button-dark" type="submit">{facility ? "Save changes" : "Add facility"}</button><Link className="button button-outline-dark" href="/admin/facilities">Cancel</Link></div>
	</form>;
}

export { PrincipalForm } from "@/components/admin-principal-form";

export function SportsMessageForm({ settings }: { settings: SportsMessageInput }) {
	return <form className="admin-form" action={updateSportsMessage}>
		<div className="admin-form-grid">
			<label>Author name<input name="sportsMessageAuthorName" required maxLength={160} defaultValue={settings.sportsMessageAuthorName ?? ""} /></label>
			<label>Role / designation<input name="sportsMessageAuthorRole" maxLength={160} defaultValue={settings.sportsMessageAuthorRole ?? ""} /></label>
			<label>Message<textarea name="sportsMessage" rows={12} required maxLength={12000} defaultValue={settings.sportsMessage ?? ""} /></label>
			<label>Photo<input aria-describedby="sports-photo-note" disabled placeholder="No photo stored" /></label>
		</div>
		<p className="admin-form-note" id="sports-photo-note">Leave role blank unless officially provided. Photo remains blank.</p>
		<div className="admin-form-actions"><button className="button button-dark" type="submit">Save Sports message</button><Link className="button button-outline-dark" href="/admin">Cancel</Link></div>
	</form>;
}

export function PhaseTwoFeedback({ status, error }: { status?: string; error?: string }) {
	const messages: Record<string, string> = {
		created: "Record added successfully.",
		updated: "Changes saved successfully.",
		deleted: "Record deleted successfully.",
	saved: "Information saved successfully.",
	"message-saved": "Sports message saved successfully.",
	};
	const errorMessages: Record<string, string> = {
		conflict: "This profile changed since you opened it. Reload before saving again.",
		required: "Complete all required fields before saving.",
		invalid: "Check the field lengths and photo URL. Photo URLs must use HTTPS or a site-relative path.",
	};
	if (status && messages[status]) return <p className="admin-feedback success" role="status">{messages[status]}</p>;
	if (error && errorMessages[error]) return <p className="admin-feedback error" role="alert">{errorMessages[error]}</p>;
	return null;
}
