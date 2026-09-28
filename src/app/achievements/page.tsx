import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
	title: "Achievements | St. Thomas English School, Ruabandha, Bhilai.",
	description: "Published achievements from St. Thomas English School.",
};

export default async function AchievementsPage() {
	const achievements = await prisma.achievement.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ achievementDate: "desc" }, { year: "desc" }, { createdAt: "desc" }] });
	return <div id="top"><SiteHeader /><main><section className="page-hero content-page-hero"><div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><strong>Achievements</strong></nav><p className="eyebrow light">School achievements</p><h1>Achievements.</h1><p className="page-hero-description">Recognising achievements published by the school.</p></div></section><section className="content-listing-section container"><div className="content-intro-row"><div><p className="eyebrow">01 / Published achievements</p><h2>School achievements.</h2></div><p>Only published records are shown.</p></div>{achievements.length ? <div className="achievement-grid">{achievements.map((item) => <article className="achievement-entry" key={item.id}><div className="achievement-photo-placeholder" role="img" aria-label={item.imageAlt || (item.imageUrl ? item.title : "Achievement photo placeholder")} style={item.imageUrl ? { backgroundImage: `url("${item.imageUrl.replaceAll('"', "%22")}")`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}>{!item.imageUrl && <span>Photo placeholder</span>}</div><div><span className="eyebrow">{item.category}</span><h3>{item.title}</h3>{item.studentName && <p>{item.studentName}</p>}{(item.achievementDate || item.year) && <small>{item.achievementDate?.toLocaleDateString() ?? item.year}</small>}{item.description && <p>{item.description}</p>}</div></article>)}</div> : <div className="admin-empty"><strong>No achievements have been published.</strong><p>School-confirmed achievements will appear here when available.</p></div>}</section></main><SiteFooter /></div>;
}
