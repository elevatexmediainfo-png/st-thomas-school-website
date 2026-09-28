import type { ReactNode } from "react";
import Link from "next/link";
import { AdmissionEnquiryForm } from "@/components/admission-enquiry-form";

type SocialLink = { label: string; url: string };
type ContactSettings = { schoolName: string | null; address: string | null; phone: string | null; email: string | null; mapLink: string | null; websiteUrl: string | null; instagramUrl: string | null; facebookUrl: string | null; youtubeUrl: string | null };

function ContactLayout({ children, schoolName }: { children: ReactNode; schoolName: string }) {
		return <main><section className="page-hero contact-page-hero"><div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><strong>Contact</strong></nav><p className="eyebrow light">Contact</p><h1>Contact the<br /><em>school.</em></h1><p className="page-hero-description">Contact information for {schoolName}.</p></div></section>{children}</main>;
	}

	export function ContactPage({ settings }: { settings: ContactSettings | null }) {
		const schoolName = settings?.schoolName || "St. Thomas English School, Ruabandha, Bhilai.";
		const links: SocialLink[] = [
			{ label: "Website", url: settings?.websiteUrl ?? "" },
			{ label: "Instagram", url: settings?.instagramUrl ?? "" },
			{ label: "Facebook", url: settings?.facebookUrl ?? "" },
			{ label: "YouTube", url: settings?.youtubeUrl ?? "" },
		].filter((item) => item.url);
		return <ContactLayout schoolName={schoolName}><section className="contact-main-section container"><div className="contact-info-panel"><p className="eyebrow">01 / Contact details</p><h2>We&apos;re here<br /><em>to help.</em></h2><div className="contact-page-details"><div><span>School</span><strong>{schoolName}</strong></div>{settings?.address && <div><span>Address</span><strong>{settings.address}</strong></div>}{settings?.phone && <div><span>Phone</span><strong><a href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}>{settings.phone}</a></strong></div>}{settings?.email && <div><span>Email</span><strong><a href={`mailto:${settings.email}`}>{settings.email}</a></strong></div>}</div>{links.length > 0 && <div className="social-placeholder"><p className="eyebrow">Online</p>{links.map((item) => <div key={item.label}><span>{item.label}</span><a href={item.url} target="_blank" rel="noreferrer">Open link</a></div>)}</div>}</div><div className="contact-map-panel"><div className="contact-map-placeholder" role="img" aria-label={settings?.address ? `School location: ${settings.address}` : "School location placeholder"}><span>{settings?.address || "Location to be provided by school"}<br /><small>School location</small></span></div>{settings?.mapLink && <a className="button button-dark map-button" href={settings.mapLink} target="_blank" rel="noreferrer">Open in Google Maps <span aria-hidden="true">↗</span></a>}</div></section><section className="contact-enquiry-section"><div className="container contact-enquiry-grid"><div><p className="eyebrow light">02 / Admission enquiry</p><h2>We&apos;d love to<br /><em>hear from you.</em></h2><p>Submit an admission enquiry to the school.</p></div><AdmissionEnquiryForm /></div></section></ContactLayout>;
	}
