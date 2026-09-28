import type { ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { aboutContent, schoolContent } from "@/content/home-content";
import { prisma } from "@/lib/prisma";

type BreadcrumbsProps = { current: string };

function Breadcrumbs({ current }: BreadcrumbsProps) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/about">About School</Link><span aria-hidden="true">/</span><strong>{current}</strong></nav>;
}

function PageHero({ eyebrow, title, description, current }: { eyebrow: string; title: string; description: string; current: string }) {
  return <section className="page-hero"><div className="container"><Breadcrumbs current={current} /><p className="eyebrow light">{eyebrow}</p><h1>{title}</h1><p className="page-hero-description">{description}</p></div></section>;
}

function AboutPageLayout({ children, eyebrow, title, description, current }: { children: ReactNode; eyebrow: string; title: string; description: string; current: string }) {
  return <div id="top"><SiteHeader /><main><PageHero eyebrow={eyebrow} title={title} description={description} current={current} />{children}</main><SiteFooter /></div>;
}

export async function AboutOverviewPage() {
  await connection();
  const settings = await prisma.schoolSetting.findUnique({ where: { id: "school" } });
  const history = settings?.schoolHistory || schoolContent.schoolHistory;
  const schoolName = settings?.schoolName || schoolContent.schoolName;
  return <AboutPageLayout eyebrow="About the school" title={schoolName} description={history.split("\n\n")[0]} current="Overview">
    <section className="about-introduction container"><div className="about-side-label"><span className="eyebrow">01 / About School</span><span className="vertical-rule" /></div><div className="about-introduction-copy"><h2>{schoolName}</h2><h3>School History</h3>{history.split("\n\n").map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph}</p>)}</div><div className="about-art" aria-hidden="true"><span>{settings?.motto || schoolContent.motto}</span><small>{settings?.address || schoolContent.location}</small></div></section>
    <section className="about-approach"><div className="container"><div className="section-heading"><div><p className="eyebrow">02 / Our approach</p><h2>Learning that makes<br /><em>a difference.</em></h2></div><p>Our shared approach can be expanded with the school&apos;s official educational principles and practices.</p></div><div className="about-approach-grid">{aboutContent.approach.map((item) => <article className="about-approach-card" key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></div></section>
    <section className="quick-facts-section container"><div className="quick-facts-heading"><p className="eyebrow">03 / Motto</p><h2>{settings?.motto || schoolContent.motto}</h2><p>{settings?.mottoSupportText || schoolContent.mottoSupportText}</p></div><div className="quick-facts-list">{aboutContent.quickFacts.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></section>
    <AboutCta />
  </AboutPageLayout>;
}

function AboutCta() {
  return <section className="about-cta"><div className="container"><p className="eyebrow">Continue exploring</p><h2>What guides<br /><em>our work.</em></h2><Link className="button button-light" href="/about/vision-mission">Vision, mission &amp; values <span aria-hidden="true">↗</span></Link></div></section>;
}

export async function VisionMissionPage() {
  await connection();
  const settings = await prisma.schoolSetting.findUnique({ where: { id: "school" } });
  const content = { ...aboutContent.visionMission, vision: settings?.vision || schoolContent.vision, mission: settings?.mission || schoolContent.mission, title: "Vision and Mission", description: `The Vision and Mission of ${settings?.schoolName || schoolContent.schoolName}` };
  return <AboutPageLayout eyebrow={content.eyebrow} title={content.title} description={content.description} current="Vision & Mission">
    <section className="vision-mission-intro container"><div className="vision-card"><p className="eyebrow">Our vision</p><h2>Vision</h2><p>{content.vision}</p></div><div className="mission-card"><p className="eyebrow">Our mission</p><h2>Mission</h2><p>{content.mission}</p></div></section>
    {content.values.length > 0 && <section className="values-section"><div className="container"><div className="section-heading"><div><p className="eyebrow">Core values</p><h2>How we show<br /><em>up each day.</em></h2></div><p>Editable value statements can be added using the school&apos;s official language.</p></div><div className="values-grid">{content.values.map((value, index) => <article className="value-card" key={value.title}><span>0{index + 1}</span><h3>{value.title}</h3><p>{value.description}</p></article>)}</div></div></section>}
    <AboutCta />
  </AboutPageLayout>;
}

async function MessagePage({ type }: { type: "principal" | "chairman" }) {
  await connection();
  const settings = await prisma.schoolSetting.findUnique({ where: { id: "school" } });
  const content = type === "principal"
    ? { ...aboutContent.principalMessage, title: settings?.principalDeskTitle || schoolContent.principalDeskTitle, description: settings?.principalMessage || schoolContent.principalMessage, name: settings?.principalName || schoolContent.principalName }
    : { ...aboutContent.chairmanMessage, description: settings?.chairmanDirectorMessage || schoolContent.chairmanDirectorMessage };
  const designation = type === "principal" ? (settings?.principalDesignation || schoolContent.principalDesignation) : "Chairman / Director";
  const photoUrl = type === "principal" ? settings?.principalPhotoUrl : null;
  const photoAlt = type === "principal" ? settings?.principalPhotoAlt : null;
  return <AboutPageLayout eyebrow={content.eyebrow} title={content.title} description="A personal note from the school leadership team. Official content can be added when available." current={type === "principal" ? "Principal's Message" : "Chairman's Message"}>
    <section className="message-section container"><div className="message-photo" role="img" aria-label={photoUrl ? photoAlt || `${content.name} photo` : content.imageLabel} style={photoUrl ? { backgroundImage: `url(${photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>{!photoUrl && <span>{content.imageLabel}</span>}</div><article className="message-copy"><p className="eyebrow">{content.eyebrow}</p>{content.description.split("\n\n").map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}<div className="signature"><span className="signature-mark">ST</span><span><strong>{content.name}</strong><small>{designation}</small></span></div></article></section>
    <section className="message-note"><div className="container"><p className="eyebrow">A note for future updates</p><h2>Official leadership content<br /><em>can live here.</em></h2></div></section>
  </AboutPageLayout>;
}

export function PrincipalMessagePage() {
  return <MessagePage type="principal" />;
}

export function ChairmanMessagePage() {
  return <MessagePage type="chairman" />;
}
