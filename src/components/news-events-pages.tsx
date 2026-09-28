import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";
import { eventCategories, noticeCategories, type EventRecord, type NoticeRecord } from "@/content/news-events-content";

function noticeView(notice: { type: "NEWS" | "NOTICE"; slug: string; title: string; publishDate: Date | null; category: string; description: string | null; content: string | null; isPinned: boolean; isArchived: boolean; imageUrl: string | null; imageAlt: string | null; documentUrl: string | null }): NoticeRecord {
  return { type: notice.type, slug: notice.slug, title: notice.title, date: notice.publishDate?.toLocaleDateString() ?? "Date not set", category: notice.category, description: notice.description ?? "", content: notice.content ?? "", pinned: notice.isPinned, published: true, archived: notice.isArchived, imageLabel: notice.imageAlt || "Image placeholder", imageUrl: notice.imageUrl, imageAlt: notice.imageAlt, documentUrl: notice.documentUrl };
}

function eventView(event: { slug: string; title: string; eventDate: Date | null; eventTime: string | null; venue: string | null; category: string; description: string | null; isFeatured: boolean; status: "UPCOMING" | "PAST"; imageUrl: string | null; imageAlt: string | null }): EventRecord {
  return { slug: event.slug, title: event.title, date: event.eventDate?.toLocaleDateString() ?? "Date not set", time: event.eventTime ?? "Time not set", venue: event.venue ?? "Venue not set", category: event.category, description: event.description ?? "", featured: event.isFeatured, published: true, status: event.status.toLowerCase() as "upcoming" | "past", imageLabel: event.imageAlt || "Image placeholder", imageUrl: event.imageUrl, imageAlt: event.imageAlt, gallery: [] };
}

type ListingLayoutProps = { children: ReactNode; title: string; description: string; current: string; eyebrow: string };

function Breadcrumbs({ current }: { current: string }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><strong>{current}</strong></nav>;
}

function ListingLayout({ children, title, description, current, eyebrow }: ListingLayoutProps) {
  return <div id="top"><SiteHeader /><main><section className="page-hero news-page-hero"><div className="container"><Breadcrumbs current={current} /><p className="eyebrow light">{eyebrow}</p><h1>{title}</h1><p className="page-hero-description">{description}</p></div></section><div className="news-page-nav"><div className="container"><p>Explore updates</p><nav aria-label="News and events pages"><Link className={current === "News & Notices" || current === "News" ? "is-current" : ""} href="/news">News &amp; Notices</Link><Link className={current === "Notices" ? "is-current" : ""} href="/news/notices">Notices</Link><Link className={current === "Events" ? "is-current" : ""} href="/events">Events</Link></nav></div></div>{children}</main><SiteFooter /></div>;
}

function NoticeCard({ notice }: { notice: NoticeRecord }) {
  const isNews = notice.type === "NEWS";
  return <article className={`notice-list-card ${notice.pinned ? "is-pinned" : ""}`}>{notice.imageUrl && <div className="notice-media-preview" role="img" aria-label={notice.imageAlt || notice.title} style={{ backgroundImage: `url("${notice.imageUrl.replaceAll('"', "%22")}")`, backgroundPosition: "center", backgroundSize: "cover" }} />}<div className="notice-list-card-top"><span className="notice-category">{notice.category}</span>{notice.pinned && <span className="pinned-label">Pinned / Important</span>}</div><p className="notice-card-date">{notice.date}</p><h3>{notice.title}</h3>{notice.description && <p>{notice.description}</p>}<Link className="text-link" href={isNews ? `/news/${notice.slug}` : `/news/notices/${notice.slug}`}>{isNews ? "Read news" : "Read notice"} <span aria-hidden="true">↗</span></Link></article>;
}

function EventCard({ event }: { event: EventRecord }) {
  return <article className={`event-list-card ${event.featured ? "is-featured" : ""}`}>{event.imageUrl && <div className="event-placeholder-image" role="img" aria-label={event.imageAlt || event.title} style={{ backgroundImage: `url("${event.imageUrl.replaceAll('"', "%22")}")`, backgroundPosition: "center", backgroundSize: "cover" }} />}<div className="event-list-card-content"><div className="event-list-meta"><span>{event.category}</span><strong>{event.status === "upcoming" ? "Upcoming" : "Past"}</strong></div><h3>{event.title}</h3><p className="event-list-date">{event.date} · {event.time}</p>{event.description && <p>{event.description}</p>}{event.venue && <p className="event-list-venue">{event.venue}</p>}<Link className="text-link" href={`/events/${event.slug}`}>View event <span aria-hidden="true">↗</span></Link></div></article>;
}

function SearchFilterBar({ label }: { label: string }) {
  return <form className="listing-filter-bar" action="#listing-results"><label htmlFor="listing-search">Search {label}<input id="listing-search" name="q" type="search" placeholder={`Search ${label.toLowerCase()}`} /></label><label htmlFor="listing-category">Category<select id="listing-category" name="category"><option>All categories</option>{(label === "notices" ? noticeCategories : eventCategories).slice(1).map((category) => <option key={category}>{category}</option>)}</select></label><button type="submit">Apply filters</button></form>;
}

export async function NewsPage() {
  const records = (await prisma.notice.findMany({ where: { type: "NEWS", status: "PUBLISHED" }, orderBy: [{ publishDate: "desc" }, { createdAt: "desc" }] })).map(noticeView);
  const latest = records.filter((record) => !record.archived);
  const archived = records.filter((record) => record.archived);
  return <ListingLayout eyebrow="News" title="School news." description="News published by St. Thomas English School." current="News & Notices"><section className="news-feature-section container"><div><p className="eyebrow">01 / Latest news</p><h2>What is new,<br /><em>at a glance.</em></h2><p>Published school news.</p><Link className="button button-dark" href="/news/notices">View notices <span aria-hidden="true">↗</span></Link></div><div className="news-feature-card">{latest[0] ? <><h3>{latest[0].title}</h3>{latest[0].description && <p>{latest[0].description}</p>}<span>{latest[0].date}</span><Link href={`/news/${latest[0].slug}`}>Read news <span aria-hidden="true">↗</span></Link></> : <><h3>No published news yet</h3><p>Published news will appear here.</p></>}</div></section><section className="news-latest-section"><div className="container"><div className="section-heading"><div><p className="eyebrow">02 / Recent news</p><h2>School updates.</h2></div><p>Published news items.</p></div>{latest.length ? <div className="notice-grid-list">{latest.map((news) => <NoticeCard key={news.slug} notice={news} />)}</div> : <p>No news items have been published.</p>}</div></section><section className="news-archive-section container"><div><p className="eyebrow">03 / Archive</p><h2>Past updates.</h2></div><div>{archived.length ? <div className="notice-grid-list">{archived.map((news) => <NoticeCard key={news.slug} notice={news} />)}</div> : <p>No archived news.</p>}</div></section></ListingLayout>;
}

export async function NoticesPage() {
  const records = await prisma.notice.findMany({ where: { type: "NOTICE", status: "PUBLISHED" }, orderBy: { publishDate: "desc" } });
  const current = records.filter((notice) => !notice.isArchived).map(noticeView);
  const archived = records.filter((notice) => notice.isArchived).map(noticeView);
  return <ListingLayout eyebrow="Notices" title="School notices." description="Notices published by St. Thomas English School." current="Notices"><section className="listing-section container"><SearchFilterBar label="notices" /><div className="listing-section-heading" id="listing-results"><p className="eyebrow">01 / Notice board</p><h2>Current notices</h2></div>{current.length ? <div className="notice-grid-list">{current.map((notice) => <NoticeCard key={notice.slug} notice={notice} />)}</div> : <p>No notices have been published.</p>}</section><section className="archive-section container" id="archive"><div className="listing-section-heading"><p className="eyebrow">02 / Archive</p><h2>Archived notices</h2></div>{archived.length ? <div className="notice-grid-list">{archived.map((notice) => <NoticeCard key={notice.slug} notice={notice} />)}</div> : <p>No archived notices.</p>}</section></ListingLayout>;
}

function NoticeDetail({ notice }: { notice: NoticeRecord }) {
  const isNews = notice.type === "NEWS";
  return <ListingLayout eyebrow={isNews ? "News detail" : "Notice detail"} title={notice.title} description="" current={isNews ? "News" : "Notice"}><article className="detail-section container"><div className="detail-meta"><span>{notice.category}</span><span>{notice.date}</span>{notice.pinned && <span>Pinned / Important</span>}</div>{notice.imageUrl && <div className="detail-image-placeholder" role="img" aria-label={notice.imageAlt || notice.title} style={{ backgroundImage: `url("${notice.imageUrl.replaceAll('"', "%22")}")`, backgroundPosition: "center", backgroundSize: "cover" }} />}<div className="detail-copy"><h2>{notice.title}</h2>{notice.content && <p>{notice.content}</p>}{notice.description && <p>{notice.description}</p>}{notice.documentUrl && <div className="attachment-placeholder"><div><p className="eyebrow">Document</p><strong>{notice.documentUrl.split("/").pop() || "Published document"}</strong></div><a className="button button-dark" href={notice.documentUrl} target="_blank" rel="noreferrer">Open document</a></div>}</div></article></ListingLayout>;
}

export function NoticeDetailPage({ notice }: { notice: NoticeRecord }) {
  return <NoticeDetail notice={notice} />;
}

export function NewsDetailPage({ news }: { news: NoticeRecord }) {
  return <NoticeDetail notice={news} />;
}

export async function EventsPage() {
  const records = await prisma.event.findMany({ where: { publication: "PUBLISHED" }, orderBy: { eventDate: "asc" } });
  const upcoming = records.filter((event) => event.status === "UPCOMING").map(eventView);
  const past = records.filter((event) => event.status === "PAST").map(eventView);
  const featured = upcoming.find((event) => event.featured) ?? upcoming[0];
  return <ListingLayout eyebrow="Events" title="Make room for memories." description="A flexible events hub for upcoming activities, past events and community moments." current="Events"><section className="listing-section container">{featured ? <div className="featured-event-card">{featured.imageUrl && <div className="event-placeholder-image" role="img" aria-label={featured.imageAlt || featured.title} style={{ backgroundImage: `url("${featured.imageUrl.replaceAll('"', "%22")}")`, backgroundPosition: "center", backgroundSize: "cover" }} />}<div><p className="eyebrow">Featured event</p><h2>{featured.title}</h2>{featured.description && <p>{featured.description}</p>}<p className="featured-event-meta">{featured.date} · {featured.time}<br />{featured.venue}</p><Link className="button button-dark" href={`/events/${featured.slug}`}>View featured event <span aria-hidden="true">↗</span></Link></div></div> : <div className="admin-empty"><strong>No published events yet</strong><p>Official events will appear here when published.</p></div>}<SearchFilterBar label="events" /><div className="listing-section-heading"><p className="eyebrow">01 / Upcoming events</p><h2>Coming up</h2></div><div className="event-grid-list">{upcoming.map((event) => <EventCard event={event} key={event.slug} />)}</div></section><section className="archive-section container"><div className="listing-section-heading"><p className="eyebrow">02 / Past events</p><h2>Event archive</h2></div><div className="event-grid-list">{past.map((event) => <EventCard event={event} key={event.slug} />)}</div></section></ListingLayout>;
}

export async function getPublishedNotice(slug: string) {
  const notice = await prisma.notice.findFirst({ where: { slug, type: "NOTICE", status: "PUBLISHED" } });
  return notice ? noticeView(notice) : null;
}

export async function getPublishedNews(slug: string) {
  const news = await prisma.notice.findFirst({ where: { slug, type: "NEWS", status: "PUBLISHED" } });
  return news ? noticeView(news) : null;
}

export async function getPublishedEvent(slug: string) {
  const event = await prisma.event.findFirst({ where: { slug, publication: "PUBLISHED" } });
  return event ? eventView(event) : null;
}

function EventDetail({ event }: { event: EventRecord }) {
  return <ListingLayout eyebrow="Event detail" title={event.title} description="Published school event details." current="Event"><article className="detail-section container"><div className="detail-meta"><span>{event.category}</span><span>{event.status === "upcoming" ? "Upcoming" : "Past"}</span><span>{event.date}</span></div>{event.imageUrl && <div className="detail-image-placeholder" role="img" aria-label={event.imageAlt || event.title} style={{ backgroundImage: `url("${event.imageUrl.replaceAll('"', "%22")}")`, backgroundPosition: "center", backgroundSize: "cover" }} />}<div className="detail-copy"><h2>{event.title}</h2>{event.description && <p>{event.description}</p>}<dl className="event-detail-list"><div><dt>Date</dt><dd>{event.date}</dd></div><div><dt>Time</dt><dd>{event.time}</dd></div><div><dt>Venue</dt><dd>{event.venue}</dd></div><div><dt>Category</dt><dd>{event.category}</dd></div><div><dt>Status</dt><dd>{event.status === "upcoming" ? "Upcoming" : "Past"}</dd></div></dl></div></article></ListingLayout>;
}

export function EventDetailPage({ event }: { event: EventRecord }) {
  return <EventDetail event={event} />;
}
