import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { homeContent, schoolContent } from "@/content/home-content";
import { getPublicSchoolIdentity } from "@/lib/public-school-identity";
import { prisma } from "@/lib/prisma";

function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: ReactNode; description?: string }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{description && <p>{description}</p>}</div>;
}

export function AcademicSection() {
  return <section className="academic-section container" id="academics"><SectionIntro eyebrow={homeContent.academics.eyebrow} title={<>Learning that builds <em>strong foundations.</em></>} description={homeContent.academics.description} /><div className="academic-grid">{homeContent.academics.stages.map((item) => <article className="academic-card" key={item.number}><span className="card-number">{item.number}</span><h3>{item.title}</h3><p>{item.description}</p><a href="#contact" aria-label={`Learn more about ${item.title}`}>Explore <span aria-hidden="true">↗</span></a></article>)}</div></section>;
}

export function SchoolLifeSection() {
  return <section className="school-life-section" id="administration"><div className="container"><SectionIntro eyebrow={homeContent.schoolLife.eyebrow} title={<>A school life with <em>purpose.</em></>} description={homeContent.schoolLife.description} /><div className="feature-grid">{homeContent.schoolLife.features.map((feature) => <article className="feature-card" key={feature.number}><span className="feature-icon" aria-hidden="true">{feature.number}</span><h3>{feature.title}</h3><p>{feature.description}</p><a href="#contact" aria-label={`Learn more about ${feature.title}`}>↗</a></article>)}</div></div></section>;
}

export async function NoticesSection() {
  const notices = await prisma.notice.findMany({ where: { type: "NOTICE", status: "PUBLISHED", isArchived: false }, orderBy: [{ isPinned: "desc" }, { publishDate: "desc" }, { createdAt: "desc" }], take: 3 });
  return <section className="notices-section" id="notices"><div className="container notices-grid"><div><p className="eyebrow">{homeContent.notices.eyebrow}</p><h2>Stay close to<br /><em>school life.</em></h2><Link className="button button-dark" href="/news/notices">View notices <span aria-hidden="true">↗</span></Link></div><div className="notices-list" id="notices-list">{notices.length ? notices.map((notice) => <Link className="notice-row" href={`/news/notices/${notice.slug}`} key={notice.id}><span className="notice-date">{notice.publishDate?.toLocaleDateString() ?? "Date not set"}</span><span className="notice-copy"><small>{notice.category}</small><strong>{notice.title}</strong>{notice.description && <small>{notice.description}</small>}</span><span className="notice-arrow" aria-hidden="true">↗</span></Link>) : <p className="home-content-empty">No notices have been published.</p>}</div></div></section>;
}

export async function EventsSection() {
  const events = await prisma.event.findMany({ where: { publication: "PUBLISHED", status: "UPCOMING" }, orderBy: [{ eventDate: "asc" }, { createdAt: "desc" }], take: 3 });
  return <section className="events-section container" id="events"><SectionIntro eyebrow={homeContent.events.eyebrow} title={<>Make room for <em>memories.</em></>} description={homeContent.events.description} />{events.length ? <div className="event-grid">{events.map((event) => <article className="event-card" key={event.id}><div className="event-date"><strong>{event.eventDate?.toLocaleDateString("en-IN", { day: "2-digit" }) ?? "Date"}</strong><span>{event.eventDate?.toLocaleDateString("en-IN", { month: "short" }) ?? "to be set"}</span></div><div><p className="event-venue">{event.venue ?? ""}</p><h3>{event.title}</h3>{event.description && <p>{event.description}</p>}</div><Link href={`/events/${event.slug}`} aria-label={`View event ${event.title}`}>↗</Link></article>)}</div> : <p className="home-content-empty">No upcoming events have been published.</p>}<Link className="text-link" href="/events">View all events <span aria-hidden="true">↗</span></Link></section>;
}

export function GallerySection({ images }: { images: Array<{ className: string; label: string; imageUrl: string | null; imageAlt: string | null }> }) {
  return <section className="gallery-section container" id="gallery"><SectionIntro eyebrow={homeContent.gallery.eyebrow} title={<>A glimpse of <em>our world.</em></>} description={homeContent.gallery.description} /><div className="gallery-grid">{images.map((image) => <a className={`gallery-tile ${image.className}`} href="#contact" aria-label={image.imageAlt || `View gallery: ${image.label}`} key={image.className} style={image.imageUrl ? { backgroundImage: `url("${image.imageUrl.replaceAll('"', "%22")}")` } : undefined}><span>{image.label}</span><i aria-hidden="true">↗</i></a>)}</div><a className="button button-dark" href="#contact">View gallery <span aria-hidden="true">↗</span></a></section>;
}

export async function ContactSection() {
  const { schoolName, location } = await getPublicSchoolIdentity();
  const settings = await prisma.schoolSetting.findUnique({ where: { id: "school" }, select: { phone: true, email: true, mapLink: true } });
  return <section className="contact-section" id="contact"><div className="container contact-grid"><div><p className="eyebrow">09 / Find us</p><h2>Come and see<br /><em>for yourself.</em></h2><div className="contact-details"><div><span>Address</span><p>{schoolName}<br />{location}</p></div>{settings?.phone && <div><span>Call</span><p><a href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}>{settings.phone}</a></p></div>}{settings?.email && <div><span>Email</span><p><a href={`mailto:${settings.email}`}>{settings.email}</a></p></div>}</div></div><div className="map-placeholder" role="img" aria-label={location ? `Map placeholder for ${location}` : "School map placeholder"}><span>{location || "School location to be provided"}<br /><small>Map</small>{settings?.mapLink && <a className="map-link" href={settings.mapLink} target="_blank" rel="noreferrer">Open in Google Maps ↗</a>}</span></div></div></section>;
}

export async function SiteFooter() {
  const { schoolName } = await getPublicSchoolIdentity();
  return <footer className="footer"><div className="container footer-grid"><div><Link className="brand footer-brand" href="/"><Image className="brand-logo" src="/school-logo.png" alt={`${schoolName} logo`} width={58} height={58} /><span className="brand-copy"><strong>{schoolName}</strong><span>{schoolContent.tagline}</span></span></Link><p>{schoolContent.footerText}</p><div className="social-links"><Link href="/contact" aria-label="Instagram">ig</Link><Link href="/contact" aria-label="Facebook">f</Link><Link href="/contact" aria-label="YouTube">yt</Link></div></div><div><p className="footer-label">Explore</p><Link href="/about">About school</Link><Link href="/academics">Academics</Link><Link href="/administration">Administration</Link><Link href="/gallery">Gallery</Link><Link href="/achievements">Achievements</Link></div><div><p className="footer-label">Helpful links</p><Link href="/admissions">Admissions</Link><Link href="/news">News &amp; Notices</Link><Link href="/events">Events</Link><Link href="/downloads">Downloads</Link></div><div><p className="footer-label">Contact</p><Link href="/contact">Contact office</Link><Link href="/contact">Parent enquiries</Link><Link href="/contact">Careers</Link></div></div><div className="container footer-bottom"><span>{schoolName}</span><span>Privacy · Accessibility</span></div></footer>;
}