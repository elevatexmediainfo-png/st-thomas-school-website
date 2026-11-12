import type { ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { LeadershipCards, LeadershipMessage } from "@/components/leadership-profiles";
import { getPublishedLeadership } from "@/lib/leadership";

export function LeadershipLayout({ title, children }: { title: string; children: ReactNode }) {
  return <div id="top"><SiteHeader /><main><section className="page-hero"><div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/administration">Administration</Link><span>/</span><strong>{title}</strong></nav><p className="eyebrow light">Leadership & Management</p><h1>{title}</h1><p className="page-hero-description">Meet the people guiding our school community.</p></div></section><div className="container leadership-section">{children}</div></main><SiteFooter /></div>;
}

export async function LeadershipPage({ role }: { role?: "PRINCIPAL" | "CHAIRMAN" }) {
  await connection();
  const all = await getPublishedLeadership();
  const profiles = role ? all.filter(profile => profile.systemRole === role) : all;
  const title = role === "PRINCIPAL" ? profiles[0]?.title || "Principal’s Desk" : role === "CHAIRMAN" ? "Chairman’s Message" : "Leadership & Management";
  return <LeadershipLayout title={title}>{profiles.length ? <>{!role && <LeadershipCards profiles={profiles} />}<div className="leadership-messages">{profiles.map(profile => <LeadershipMessage key={profile.id} profile={profile} />)}</div></> : <p className="leadership-empty">Leadership information will be shared here when published by the school.</p>}{role && <Link className="text-link" href="/leadership">Meet all our leadership ↗</Link>}</LeadershipLayout>;
}
