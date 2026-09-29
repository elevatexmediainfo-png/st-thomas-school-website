import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminMediaField } from "@/components/admin-media-field";
import { AdminShell } from "@/components/admin-shell";
import { schoolContent } from "@/content/home-content";
import { prisma } from "@/lib/prisma";
import { updateSchoolInformation } from "./actions";

export default async function SchoolInformationPage({ searchParams }: { searchParams: Promise<{ status?: string; error?: string }> }) {
	if (!(await auth())?.user) redirect("/admin/login");
	const [settings, feedback] = await Promise.all([
		prisma.schoolSetting.findUnique({ where: { id: "school" } }),
		searchParams,
	]);

	return <AdminShell title="School Information" description="Update the official information displayed across the public website.">
		{feedback.status === "saved" && <p className="admin-feedback success" role="status">School information saved. Public pages now show the updated values.</p>}
		{feedback.error === "required" && <p className="admin-feedback error" role="alert">Complete all five fields before saving.</p>}
		{feedback.error === "too-long" && <p className="admin-feedback error" role="alert">One or more fields exceed the allowed character limit.</p>}
		{feedback.error === "invalid-media" && <p className="admin-feedback error" role="alert">Check the Home Page image URLs, storage references, and alt text.</p>}
		<form className="admin-form" action={updateSchoolInformation}>
			<div className="admin-form-grid">
				<label htmlFor="schoolName">School name<input id="schoolName" name="schoolName" maxLength={160} required defaultValue={settings?.schoolName ?? schoolContent.schoolName} /></label>
				<label htmlFor="location">School location<input id="location" name="location" maxLength={250} required defaultValue={settings?.address ?? schoolContent.location} /></label>
				<label htmlFor="vision">Vision<textarea id="vision" name="vision" rows={5} maxLength={5000} required defaultValue={settings?.vision ?? schoolContent.vision} /></label>
				<label htmlFor="mission">Mission<textarea id="mission" name="mission" rows={7} maxLength={5000} required defaultValue={settings?.mission ?? schoolContent.mission} /></label>
				<label htmlFor="history">History<textarea id="history" name="history" rows={9} maxLength={12000} required defaultValue={settings?.schoolHistory ?? schoolContent.schoolHistory} /></label>
			</div>
			<section className="admin-home-media-section" aria-labelledby="home-page-images-heading">
				<h2 id="home-page-images-heading">Home Page Images</h2>
				<div className="admin-form-grid">
					<AdminMediaField label="Hero Image" urlName="heroImageUrl" keyName="heroImageKey" altName="heroImageAlt" initialUrl={settings?.heroImageUrl} initialKey={settings?.heroImageKey} initialAlt={settings?.heroImageAlt} />
					<AdminMediaField label="Intro / About Image" urlName="introImageUrl" keyName="introImageKey" altName="introImageAlt" initialUrl={settings?.introImageUrl} initialKey={settings?.introImageKey} initialAlt={settings?.introImageAlt} />
					<AdminMediaField label="Gallery Image 1" urlName="galleryImageOneUrl" keyName="galleryImageOneKey" altName="galleryImageOneAlt" initialUrl={settings?.galleryImageOneUrl} initialKey={settings?.galleryImageOneKey} initialAlt={settings?.galleryImageOneAlt} />
					<AdminMediaField label="Gallery Image 2" urlName="galleryImageTwoUrl" keyName="galleryImageTwoKey" altName="galleryImageTwoAlt" initialUrl={settings?.galleryImageTwoUrl} initialKey={settings?.galleryImageTwoKey} initialAlt={settings?.galleryImageTwoAlt} />
					<AdminMediaField label="Gallery Image 3" urlName="galleryImageThreeUrl" keyName="galleryImageThreeKey" altName="galleryImageThreeAlt" initialUrl={settings?.galleryImageThreeUrl} initialKey={settings?.galleryImageThreeKey} initialAlt={settings?.galleryImageThreeAlt} />
					<AdminMediaField label="Gallery Image 4" urlName="galleryImageFourUrl" keyName="galleryImageFourKey" altName="galleryImageFourAlt" initialUrl={settings?.galleryImageFourUrl} initialKey={settings?.galleryImageFourKey} initialAlt={settings?.galleryImageFourAlt} />
					<AdminMediaField label="Gallery Image 5" urlName="galleryImageFiveUrl" keyName="galleryImageFiveKey" altName="galleryImageFiveAlt" initialUrl={settings?.galleryImageFiveUrl} initialKey={settings?.galleryImageFiveKey} initialAlt={settings?.galleryImageFiveAlt} />
				</div>
			</section>
			<div className="admin-form-actions">
				<button className="button button-dark" type="submit">Save School Information</button>
				<Link className="button button-outline-dark" href="/admin">Cancel</Link>
			</div>
		</form>
	</AdminShell>;
}