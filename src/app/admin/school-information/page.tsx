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
					<AdminMediaField label="Hero Image" urlName="heroImageUrl" keyName="heroImageKey" altName="heroImageAlt" initialUrl={settings?.heroImageUrl} initialKey={settings?.heroImageKey} initialAlt={settings?.heroImageAlt} placement="Main homepage hero/banner" recommendedDimensions="1920 × 1080 px source; rendered full-bleed at 1440 × 605 px desktop, 1050 × 580 px tablet, and 390 × 535 px mobile" aspectRatio="Flexible responsive crop; source 16:9 landscape" guidance="School building, campus, or wide school-life photograph with the main subject near the center" />
					<AdminMediaField label="Intro / About Image" urlName="introImageUrl" keyName="introImageKey" altName="introImageAlt" initialUrl={settings?.introImageUrl} initialKey={settings?.introImageKey} initialAlt={settings?.introImageAlt} placement="About section artwork beside the school introduction" recommendedDimensions="1200 × 800 px source; rendered at approximately 279 × 185 px desktop and 175 × 185 px tablet/mobile" aspectRatio="3:2 source; displayed in a responsive cover box" guidance="A welcoming school, classroom, students learning, or campus detail photograph" />
					<AdminMediaField label="Principal Photo" urlName="principalPhotoUrl" keyName="principalPhotoKey" altName="principalPhotoAlt" initialUrl={settings?.principalPhotoUrl} initialKey={settings?.principalPhotoKey} initialAlt={settings?.principalPhotoAlt} placement="Homepage welcome / Principal's message section" recommendedDimensions="800 × 1000 px source; rendered full-height at min 500 px desktop and 340 px mobile" aspectRatio="Portrait; approximately 4:5 or 3:4" guidance="Clear professional portrait or official photograph of the Principal" />
					<AdminMediaField label="Gallery Image 1" urlName="galleryImageOneUrl" keyName="galleryImageOneKey" altName="galleryImageOneAlt" initialUrl={settings?.galleryImageOneUrl} initialKey={settings?.galleryImageOneKey} initialAlt={settings?.galleryImageOneAlt} placement="First, large feature tile in the homepage gallery" recommendedDimensions="1200 × 870 px source; rendered at approximately 538 × 390 px desktop and 16:9 full-width mobile" aspectRatio="Approximately 1.38:1 desktop; 16:9 mobile" guidance="A strong wide view of school life, campus, or a signature school moment" />
					<AdminMediaField label="Gallery Image 2" urlName="galleryImageTwoUrl" keyName="galleryImageTwoKey" altName="galleryImageTwoAlt" initialUrl={settings?.galleryImageTwoUrl} initialKey={settings?.galleryImageTwoKey} initialAlt={settings?.galleryImageTwoAlt} placement="Upper middle tile in the homepage gallery" recommendedDimensions="1200 × 715 px source; rendered at approximately 319 × 190 px desktop" aspectRatio="Approximately 1.68:1 desktop; square on narrow mobile screens" guidance="A focused classroom, learning activity, or student collaboration photograph" />
					<AdminMediaField label="Gallery Image 3" urlName="galleryImageThreeUrl" keyName="galleryImageThreeKey" altName="galleryImageThreeAlt" initialUrl={settings?.galleryImageThreeUrl} initialKey={settings?.galleryImageThreeKey} initialAlt={settings?.galleryImageThreeAlt} placement="Upper right tile in the homepage gallery" recommendedDimensions="1200 × 715 px source; rendered at approximately 319 × 190 px desktop" aspectRatio="Approximately 1.68:1 desktop; square on narrow mobile screens" guidance="A school activity, arts, sports, or co-curricular photograph" />
					<AdminMediaField label="Gallery Image 4" urlName="galleryImageFourUrl" keyName="galleryImageFourKey" altName="galleryImageFourAlt" initialUrl={settings?.galleryImageFourUrl} initialKey={settings?.galleryImageFourKey} initialAlt={settings?.galleryImageFourAlt} placement="Lower middle tile on desktop; wide lower tile at tablet/mobile widths" recommendedDimensions="1200 × 715 px source; rendered at approximately 319 × 190 px desktop, 1010 × 130 px tablet, and 16:9 mobile" aspectRatio="Approximately 1.68:1 desktop; wide tablet crop; 16:9 mobile" guidance="A campus, assembly, event, or group photograph with important content kept near the center" />
					<AdminMediaField label="Gallery Image 5" urlName="galleryImageFiveUrl" keyName="galleryImageFiveKey" altName="galleryImageFiveAlt" initialUrl={settings?.galleryImageFiveUrl} initialKey={settings?.galleryImageFiveKey} initialAlt={settings?.galleryImageFiveAlt} placement="Lower right tile in the homepage gallery" recommendedDimensions="1200 × 715 px source; rendered at approximately 319 × 190 px desktop" aspectRatio="Approximately 1.68:1 desktop; 16:9 mobile" guidance="A classroom, facility, or close school-life photograph with a clear focal point" />
				</div>
			</section>
			<div className="admin-form-actions">
				<button className="button button-dark" type="submit">Save School Information</button>
				<Link className="button button-outline-dark" href="/admin">Cancel</Link>
			</div>
		</form>
	</AdminShell>;
}