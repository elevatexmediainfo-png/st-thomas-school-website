import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";
import { downloadCategories, type DownloadRecord } from "@/content/admissions-resources-content";
import { prisma } from "@/lib/prisma";

function ResourceLayout({ children, title, description, current, eyebrow }: { children: ReactNode; title: string; description: string; current: string; eyebrow: string }) {
  return <div id="top"><SiteHeader /><main><section className="page-hero resource-page-hero"><div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><strong>{current}</strong></nav><p className="eyebrow light">{eyebrow}</p><h1>{title}</h1><p className="page-hero-description">{description}</p></div></section><div className="resource-nav"><div className="container"><p>Explore resources</p><nav aria-label="Resource pages"><Link className={current === "Admissions" ? "is-current" : ""} href="/admissions">Admissions</Link><Link className={current === "Downloads" ? "is-current" : ""} href="/downloads">Downloads</Link></nav></div></div>{children}</main><SiteFooter /></div>;
}

function ResourceFilter() {
  return <form className="listing-filter-bar resource-filter" action="#resource-results"><label htmlFor="resource-search">Search downloads<input id="resource-search" name="q" type="search" placeholder="Search downloads" /></label><label htmlFor="resource-category">Category<select id="resource-category" name="category"><option>All categories</option>{downloadCategories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><button type="submit">Apply filters</button></form>;
}

function DownloadCard({ item }: { item: DownloadRecord }) {
  return <article className="download-card"><div className="download-card-icon" aria-hidden="true">PDF</div><div><div className="download-card-meta"><span>{item.category}</span><small>{item.publishDate}</small></div><h3>{item.title}</h3><p>{item.description}</p><div className="download-card-file"><span>{item.fileType} · {item.fileSize}</span><button type="button" disabled>Download unavailable</button></div></div></article>;
}

export async function DownloadsPage() {
  const records = await prisma.download.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishDate: "desc" } });
  const items: DownloadRecord[] = records.map((item) => ({ id: item.id, title: item.title, category: item.category, description: item.description ?? "", file: item.fileUrl, fileType: item.fileType ?? "File", fileSize: item.fileSize ?? "Size not provided", publishDate: item.publishDate?.toLocaleDateString() ?? "Date not provided", published: true }));
  return <ResourceLayout eyebrow="Downloads" title="Useful documents, clearly organised." description="A searchable document library prepared for official school forms, circulars, calendars and resources." current="Downloads"><section className="resource-section container"><div className="resource-intro"><div><p className="eyebrow">01 / Document library</p><h2>Find what you<br /><em>need.</em></h2></div><p>Published school documents will appear here.</p></div><ResourceFilter /><div className="download-grid" id="resource-results">{items.map((item) => <DownloadCard item={item} key={item.id} />)}</div></section></ResourceLayout>;
}

