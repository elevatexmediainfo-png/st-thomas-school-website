import type { ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { SiteFooter } from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";
import { academicContent, academicProgramsContent, facilitiesContent, schoolContent } from "@/content/home-content";
import { prisma } from "@/lib/prisma";

const academicLinks = [
  ["Overview", "/academics"],
  ["Classes", "/academics/classes"],
  ["Curriculum", "/academics/curriculum"],
  ["Subjects", "/academics/subjects"],
  ["Teaching methodology", "/academics/teaching-methodology"],
  ["Examination system", "/academics/examination-system"],
  ["Academic calendar", "/academics/academic-calendar"],
  ["Co-curricular activities", "/academics/co-curricular-activities"],
  ["Sports", "/academics/sports"],
  ["Campus facilities", "/academics/facilities"],
] as const;

type LayoutProps = { children: ReactNode; title: string; description: string; current: string; eyebrow?: string };

function Breadcrumbs({ current }: { current: string }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/academics">Academics</Link><span aria-hidden="true">/</span><strong>{current}</strong></nav>;
}

function AcademicLayout({ children, title, description, current, eyebrow = "Academics" }: LayoutProps) {
  return <div id="top"><SiteHeader /><main><section className="page-hero academic-page-hero"><div className="container"><Breadcrumbs current={current} /><p className="eyebrow light">{eyebrow}</p><h1>{title}</h1><p className="page-hero-description">{description}</p></div></section><div className="academic-page-nav"><div className="container"><p className="academic-page-nav-label">Explore academics</p><nav aria-label="Academic pages">{academicLinks.map(([label, href]) => <Link className={label === current ? "is-current" : ""} href={href} key={href}>{label}</Link>)}</nav></div></div>{children}</main><SiteFooter /></div>;
}

function ListCards({ items, className = "academic-list-grid" }: { items: readonly (readonly string[])[]; className?: string }) {
  return <div className={className}>{items.map(([title, description], index) => <article className="academic-info-card" key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{description}</p></article>)}</div>;
}

function AcademicIntro({ eyebrow, title, description, children }: { eyebrow: string; title: ReactNode; description: string; children?: ReactNode }) {
  return <section className="academic-content-section container"><div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><p>{description}</p></div>{children}</section>;
}

function readAcademicPrograms(extraSettings: unknown) {
  if (extraSettings && typeof extraSettings === "object" && !Array.isArray(extraSettings) && "academicPrograms" in extraSettings && Array.isArray(extraSettings.academicPrograms)) {
    return extraSettings.academicPrograms.flatMap((item) => {
      if (!item || typeof item !== "object" || !("name" in item) || typeof item.name !== "string") return [];
      return [{ name: item.name, description: "description" in item && typeof item.description === "string" ? item.description : "" }];
    });
  }
  return academicProgramsContent.programs;
}

export async function AcademicsOverviewPage() {
  await connection();
  const settings = await prisma.schoolSetting.findUnique({ where: { id: "school" }, select: { extraSettings: true } });
  const programs = readAcademicPrograms(settings?.extraSettings);
  const content = academicContent.overview;
  return <AcademicLayout title={content.title} description={content.description} current="Overview" eyebrow="Academic overview"><AcademicIntro eyebrow="01 / The academic journey" title={<>Learning that supports<br /><em>every next step.</em></>} description="A generic academic foundation ready to be refined with the school's official information."><ListCards items={content.sections} /></AcademicIntro><AcademicIntro eyebrow="02 / Academic programs" title={<>Programs for<br /><em>growing minds.</em></>} description={academicProgramsContent.description}><div className="academic-list-grid">{programs.map((program) => <article className="academic-info-card" key={program.name}><h3>{program.name}</h3>{program.description ? <p>{program.description}</p> : <p>Official program description pending.</p>}</article>)}</div></AcademicIntro><section className="academic-highlight-band"><div className="container"><p className="eyebrow light">03 / Academic highlights</p><h2>Knowledge, confidence<br /><em>and possibility.</em></h2><p>Academic highlights, programmes and support details can be added here as the official content becomes available.</p></div></section><AcademicLinksCta /></AcademicLayout>;
}

function AcademicLinksCta() {
  return <section className="academic-links-cta"><div className="container"><p className="eyebrow">Continue exploring</p><h2>Find the right<br /><em>starting point.</em></h2><Link className="button button-dark" href="/academics/classes">Explore classes <span aria-hidden="true">↗</span></Link></div></section>;
}

export function ClassesPage() {
  return <AcademicLayout title="Classes and learning stages." description="A clear class-level structure that can be updated with the school's official classes and age ranges." current="Classes"><AcademicIntro eyebrow="01 / Class structure" title={<>A considered journey<br /><em>through school.</em></>} description="Descriptions are generic placeholders. Exact class availability and naming can be added when confirmed."><div className="class-stage-grid">{academicContent.classes.map(([number, title, description]) => <article className="class-stage-card" key={title}><span>{number}</span><h3>{title}</h3><p>{description}</p><Link href="/contact">Details to be updated <span aria-hidden="true">↗</span></Link></article>)}</div></AcademicIntro><AcademicLinksCta /></AcademicLayout>;
}

export function CurriculumPage() {
  return <AcademicLayout title="A curriculum for connected learning." description="An editable curriculum overview focused on understanding, application and the development of thoughtful learners." current="Curriculum"><AcademicIntro eyebrow="01 / Curriculum overview" title={<>Build understanding,<br /><em>not just recall.</em></>} description="The official curriculum framework and subject-specific information can be added here when available."><ListCards items={academicContent.curriculum} /></AcademicIntro></AcademicLayout>;
}

export function SubjectsPage() {
  return <AcademicLayout title="Subjects that open doors." description="A clean subject-category structure ready to be aligned with the school's official curriculum." current="Subjects"><AcademicIntro eyebrow="01 / Subject categories" title={<>Many ways to<br /><em>discover.</em></>} description="The examples below are generic and editable. Actual subject offerings can be inserted later."><div className="subject-grid">{academicContent.subjects.map(([title, description], index) => <article className="subject-card" key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div></AcademicIntro></AcademicLayout>;
}

export function TeachingMethodologyPage() {
  return <AcademicLayout title="Teaching that invites participation." description="A flexible methodology page for explaining how learning experiences are designed and supported." current="Teaching methodology"><AcademicIntro eyebrow="01 / Teaching methodology" title={<>Make learning<br /><em>meaningful.</em></>} description="These principles are broad, editable placeholders and do not describe confirmed school practices."><ListCards items={academicContent.teachingMethodology} className="academic-list-grid academic-list-grid-six" /></AcademicIntro></AcademicLayout>;
}

export function ExaminationSystemPage() {
  return <AcademicLayout title="Assessment with a clear purpose." description="An editable examination and assessment structure for official policy details to be added later." current="Examination system"><AcademicIntro eyebrow="01 / Examination system" title={<>Understand progress<br /><em>over time.</em></>} description="The school's actual assessment policy, schedules and grading information can be added here when confirmed."><ListCards items={academicContent.examinationSystem} /></AcademicIntro></AcademicLayout>;
}

export function AcademicCalendarPage() {
  return <AcademicLayout title="Academic calendar." description="A professional calendar layout with clearly marked demo entries awaiting official dates." current="Academic calendar"><AcademicIntro eyebrow="01 / Calendar placeholder" title={<>The year,<br /><em>at a glance.</em></>} description="All entries below are DEMO / PLACEHOLDER items and must be replaced with official school dates."><div className="calendar-list">{academicContent.academicCalendar.map(([title, label, description], index) => <article key={title}><span className="calendar-number">0{index + 1}</span><div><small>DEMO / PLACEHOLDER</small><h3>{title}</h3><p>{description}</p></div><span className="calendar-date">{label}</span></article>)}</div></AcademicIntro></AcademicLayout>;
}


export function CoCurricularPage() {
  return <AcademicLayout title="Learning beyond the classroom." description="A flexible space for co-curricular activities, participation and creative opportunities." current="Co-curricular activities"><AcademicIntro eyebrow="01 / Co-curricular activities" title={<>Make space for<br /><em>every interest.</em></>} description="Official activities, clubs and participation details can be added here as they become available."><ListCards items={academicContent.coCurricular} className="academic-list-grid academic-list-grid-six" /></AcademicIntro></AcademicLayout>;
}

export async function SportsPage() {
  await connection();
  const settings = await prisma.schoolSetting.findUnique({ where: { id: "school" } });
  const sports = await prisma.sport.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ sortOrder: "asc" }, { category: "asc" }] });
  const message = settings?.sportsMessage || schoolContent.sportsMessage;
  const authorName = settings?.sportsMessageAuthorName || schoolContent.sportsMessageAuthorName;
  const authorRole = settings?.sportsMessageAuthorRole || schoolContent.sportsMessageAuthorRole;
  const sportItems = sports.map((sport) => [sport.name, sport.description || sport.category]);
  return <AcademicLayout title="Movement, teamwork and wellbeing." description="Sports and physical education information published by the school." current="Sports">
    <AcademicIntro eyebrow="01 / Sports and physical education" title={<>Grow through<br /><em>movement.</em></>} description="Explore the sports and physical education activities published by the school.">
      {sportItems.length ? <ListCards items={sportItems} /> : <p>No official sports activity details have been published yet.</p>}
    </AcademicIntro>
    <section className="message-section container">
      <div className="message-photo" role="img" aria-label="Sports message photo placeholder"><span>Sports message photo placeholder</span></div>
      <article className="message-copy">
        <p className="eyebrow">Sports message</p>
        {message.split("\n\n").map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
        <div className="signature"><span className="signature-mark">ST</span><span><strong>{authorName}</strong>{authorRole && <small>{authorRole}</small>}</span></div>
      </article>
    </section>
  </AcademicLayout>;
}

export async function FacilitiesPage() {
  await connection();
  const facilities = await prisma.facility.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ sortOrder: "asc" }, { category: "asc" }] });
  const content = facilitiesContent;
  const items = facilities.length ? facilities.map((facility) => ({ name: facility.name, category: facility.category, description: facility.description, imageUrl: facility.imageUrl, imageAlt: facility.imageAlt })) : content.categories.map((facility) => ({ name: facility.category, category: facility.category, description: facility.description, imageUrl: null, imageAlt: null }));
  return <AcademicLayout title={content.title} description="Explore the facility categories confirmed by the school." current="Campus facilities"><AcademicIntro eyebrow="01 / Campus facilities" title={<>Spaces for<br /><em>learning and growth.</em></>} description="Descriptions and photographs will be added when official details are supplied."><div className="academic-list-grid">{items.map((facility) => <article className="academic-info-card" key={`${facility.category}-${facility.name}`}><span>{facility.category}</span><h3>{facility.name}</h3>{facility.imageUrl && <div className="facility-photo" role="img" aria-label={facility.imageAlt || `${facility.name} photo`} style={{ backgroundImage: `url(${facility.imageUrl})` }} />}{facility.description ? <p>{facility.description}</p> : <p>Official facility description pending.</p>}</article>)}</div></AcademicIntro></AcademicLayout>;
}
