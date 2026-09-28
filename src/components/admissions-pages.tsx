import type { ReactNode } from "react";
import Link from "next/link";
import type { AdmissionSetting } from "@/generated/prisma/client";
import { AdmissionEnquiryForm } from "@/components/admission-enquiry-form";

type PageLayoutProps = { children: ReactNode; title: string; description: string; current: string; eyebrow: string };

function PageLayout({ children, title, description, current, eyebrow }: PageLayoutProps) {
	return <main><section className="page-hero resource-page-hero"><div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><strong>{current}</strong></nav><p className="eyebrow light">{eyebrow}</p><h1>{title}</h1><p className="page-hero-description">{description}</p></div></section><div className="resource-nav"><div className="container"><p>Explore resources</p><nav aria-label="Resource pages"><Link className={current === "Admissions" ? "is-current" : ""} href="/admissions">Admissions</Link><Link href="/downloads">Downloads</Link></nav></div></div>{children}</main>;
}

function stringList(value: unknown) {
	return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

export function AdmissionsPage({ settings }: { settings: AdmissionSetting | null }) {
	const process = stringList(settings?.admissionProcess);
	const documents = stringList(settings?.requiredDocuments);
	const classes = stringList(settings?.availableClasses);
	const instructions = stringList(settings?.importantInstructions);
	const isPublished = settings?.isPublished ?? false;
	const title = isPublished ? settings?.headline || "Admissions information" : "Admissions information";
	const description = isPublished ? settings?.introduction || "Admission information will be provided by the school." : "Admission information will be provided by the school.";
	return <PageLayout eyebrow="Admissions" title={title} description={description} current="Admissions">{isPublished ? <><section className="resource-section container"><div className="resource-intro"><div><p className="eyebrow">01 / Admission process</p><h2>Information<br /><em>for families.</em></h2></div><p>Current information published by the school.</p></div>{process.length ? <div className="process-grid">{process.map((step, index) => <article key={`${index}-${step}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></article>)}</div> : <p className="content-empty-state">Admission process to be provided by school.</p>}</section><section className="admission-details-section"><div className="container"><div className="resource-intro"><div><p className="eyebrow">02 / Admission information</p><h2>Details.</h2></div><p>Only information supplied by the school is shown.</p></div><div className="admission-detail-grid"><article><span>Available classes</span><p>{classes.length ? classes.join(", ") : "Content to be provided by school"}</p></article><article><span>Eligibility</span><p>{settings?.eligibility || "Content to be provided by school"}</p></article><article><span>Important dates</span><p>{settings?.startDate?.toLocaleDateString() || "Content to be provided by school"}{settings?.endDate ? ` – ${settings.endDate.toLocaleDateString()}` : ""}</p></article><article><span>Required documents</span>{documents.length ? <ul>{documents.map((document) => <li key={document}>{document}</li>)}</ul> : <p>Content to be provided by school</p>}</article></div></div></section><section className="resource-section container"><div className="resource-intro"><div><p className="eyebrow">03 / Instructions</p><h2>Before you<br /><em>enquire.</em></h2></div></div>{instructions.length ? <ul className="editable-list">{instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ul> : <p className="content-empty-state">General instructions to be provided by school.</p>}</section></> : <section className="resource-section container"><div className="admin-empty"><strong>Admission details are not published.</strong><p>Information will appear here when provided and published by the school.</p></div></section>}<section className="enquiry-section" id="enquiry"><div className="container enquiry-grid"><div><p className="eyebrow light">04 / Admission enquiry</p><h2>Ask the<br /><em>school.</em></h2><p>Submit an enquiry to the school office.</p></div><AdmissionEnquiryForm /></div></section></PageLayout>;
}
