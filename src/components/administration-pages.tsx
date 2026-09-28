import type { ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { SiteFooter } from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";
import { administrationContent, schoolContent } from "@/content/home-content";
import { prisma } from "@/lib/prisma";
import { $Enums } from "@/generated/prisma/client";

const facultyCategoryLabels: Record<string, string> = { TEACHING_FACULTY: "Teaching Faculty", ACADEMIC_COORDINATOR: "Academic Coordinators", ADMINISTRATIVE_STAFF: "Administrative Staff", SUPPORT_STAFF: "Support Staff" };

const administrationLinks = [
  ["Overview", "/administration"],
  ["Principal", "/administration/principal"],
  ["Chairman / Director", "/administration/chairman-director"],
  ["Management", "/administration/management"],
  ["Faculty & Staff", "/administration/faculty-staff"],
] as const;

type LayoutProps = { children: ReactNode; title: string; description: string; current: string; eyebrow?: string };

function Breadcrumbs({ current }: { current: string }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/administration">Administration</Link><span aria-hidden="true">/</span><strong>{current}</strong></nav>;
}

function AdministrationLayout({ children, title, description, current, eyebrow = "Administration" }: LayoutProps) {
  return <div id="top"><SiteHeader /><main><section className="page-hero administration-page-hero"><div className="container"><Breadcrumbs current={current} /><p className="eyebrow light">{eyebrow}</p><h1>{title}</h1><p className="page-hero-description">{description}</p></div></section><div className="administration-page-nav"><div className="container"><p className="administration-page-nav-label">Explore administration</p><nav aria-label="Administration pages">{administrationLinks.map(([label, href]) => <Link className={label === current ? "is-current" : ""} href={href} key={href}>{label}</Link>)}</nav></div></div>{children}</main><SiteFooter /></div>;
}

function AdministrationIntro({ eyebrow, title, description, children }: { eyebrow: string; title: ReactNode; description: string; children?: ReactNode }) {
  return <section className="administration-content-section container"><div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><p>{description}</p></div>{children}</section>;
}

function AdministrationLinksCta() {
  return <section className="administration-links-cta"><div className="container"><p className="eyebrow">Continue exploring</p><h2>Meet the people<br /><em>behind the work.</em></h2><Link className="button button-dark" href="/administration/faculty-staff">Faculty &amp; staff <span aria-hidden="true">↗</span></Link></div></section>;
}

export function AdministrationOverviewPage() {
  const content = administrationContent.overview;
  return <AdministrationLayout title={content.title} description={content.description} current="Overview" eyebrow="School administration"><AdministrationIntro eyebrow="01 / An overview" title={<>Leadership with<br /><em>purpose and care.</em></>} description="Administrative structures are designed to support a positive, organised and student-focused school environment."><div className="administration-overview-grid">{content.sections.map(([title, description], index) => <article className="administration-info-card" key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div></AdministrationIntro><section className="administration-highlight-band"><div className="container"><p className="eyebrow light">02 / Working together</p><h2>Many roles,<br /><em>one community.</em></h2><p>Official leadership and team details can be added here when they are ready to be shared.</p></div></section><AdministrationLinksCta /></AdministrationLayout>;
}

async function LeadershipMessagePage({ type }: { type: "principal" | "chairman" }) {
  await connection();
  const settings = await prisma.schoolSetting.findUnique({ where: { id: "school" } });
  const content = type === "principal"
    ? { ...administrationContent.principal, name: settings?.principalName || schoolContent.principalName, profile: settings?.principalMessage || "Official Principal's Desk message pending publication." }
    : administrationContent.chairmanDirector;
  const current = type === "principal" ? "Principal" : "Chairman / Director";
  const designation = type === "principal" ? (settings?.principalDesignation || schoolContent.principalDesignation) : "Chairman / Director";
  const principalPhotoUrl = type === "principal" ? settings?.principalPhotoUrl : null;
  const principalPhotoAlt = type === "principal" ? settings?.principalPhotoAlt : null;
  return <AdministrationLayout title={content.title} description={content.description} current={current} eyebrow={type === "principal" ? "School leadership" : "Leadership placeholder"}><section className="administration-message-section container"><div className="administration-photo-placeholder" role="img" aria-label={principalPhotoUrl ? principalPhotoAlt || `${content.name} photo` : `${designation} photo placeholder`} style={principalPhotoUrl ? { backgroundImage: `url(${principalPhotoUrl})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}>{!principalPhotoUrl && <span>{designation} photo<br /><small>Placeholder image</small></span>}</div><article className="administration-message-copy"><p className="eyebrow">{designation}</p><p>{content.profile}</p><p>This editable profile can be replaced with the official message, background and responsibilities when available. No name or qualification has been provided for this placeholder profile.</p><div className="signature"><span className="signature-mark">ST</span><span><strong>{content.name}</strong><small>{designation}</small></span></div></article></section>{type === "principal" && <section className="academic-leadership-section"><div className="container"><p className="eyebrow">Academic leadership</p><h2>Supporting learning<br /><em>across the school.</em></h2><p>Academic leadership details can be added here to explain planning, coordination, teacher support and student-focused academic development.</p></div></section>}</AdministrationLayout>;
}

export function PrincipalAdministrationPage() {
  return <LeadershipMessagePage type="principal" />;
}

export function ChairmanDirectorPage() {
  return <LeadershipMessagePage type="chairman" />;
}

export function ManagementPage() {
  const content = administrationContent.management;
  return <AdministrationLayout title={content.title} description={content.description} current="Management"><AdministrationIntro eyebrow="01 / Management structure" title={<>Shared responsibility<br /><em>in action.</em></>} description="Positions below are editable placeholders and do not represent confirmed people or organisational facts."><div className="management-structure">{content.positions.map(([number, title, description]) => <article key={title}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div><i aria-hidden="true">↗</i></article>)}</div></AdministrationIntro><AdministrationLinksCta /></AdministrationLayout>;
}

export async function FacultyStaffPage() {
  await connection();
  const content = administrationContent.facultyStaff;
  const members = await prisma.facultyMember.findMany({ where: { status: $Enums.PublicationStatus.PUBLISHED }, orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
  const categories = (Object.keys(facultyCategoryLabels) as Array<keyof typeof facultyCategoryLabels>).map((category) => ({ category, label: facultyCategoryLabels[category], members: members.filter((member) => member.category === category) }));
  const hasMembers = members.length > 0;
  return <AdministrationLayout title={content.title} description={content.description} current="Faculty & Staff"><AdministrationIntro eyebrow="01 / Faculty directory" title={<>People who help<br /><em>learning happen.</em></>} description="Faculty and staff details are published by the school through the admin panel.">{hasMembers ? <div className="faculty-category-grid">{categories.filter((group) => group.members.length).map((group) => <section className="faculty-category" key={group.category}><h3>{group.label}</h3>{group.members.map((member) => <div className="faculty-card" key={member.id}><div className="faculty-photo-placeholder" role="img" aria-label={member.photoUrl ? member.photoAlt || `${member.fullName} photo` : "Faculty photo placeholder"} style={member.photoUrl ? { backgroundImage: `url(${member.photoUrl})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}>{!member.photoUrl && <span>Photo<br />placeholder</span>}</div><div><strong>{member.fullName}</strong><small>{member.designation}</small>{member.subject && <small>Subject: {member.subject}</small>}{member.department && <small>Department: {member.department}</small>}{member.qualification && <small>Qualification: {member.qualification}</small>}</div></div>)}</section>)}</div> : <div className="faculty-category-grid">{content.categories.map((category) => <section className="faculty-category" key={category.title}><h3>{category.title}</h3><div className="faculty-card"><div className="faculty-photo-placeholder" role="img" aria-label={`${category.title} photo placeholder`}><span>Photo<br />placeholder</span></div><div><p className="eyebrow">Editable profile</p><strong>Name placeholder</strong><small>Designation to be updated</small><small>{category.department}</small></div></div></section>)}</div>}</AdministrationIntro></AdministrationLayout>;
}
