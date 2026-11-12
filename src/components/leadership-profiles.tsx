import Link from "next/link";
import type { LeadershipProfile } from "@/lib/leadership-profiles";
import { LeadershipPortrait } from "@/components/leadership-portrait";

export function LeadershipCards({ profiles }: { profiles: LeadershipProfile[] }) {
  return <div className="leadership-grid">{profiles.map(profile => <article className="leadership-card" key={profile.id}><LeadershipPortrait profile={profile} /><div><p className="eyebrow">{profile.designation}</p><h3>{profile.fullName}</h3><p>{profile.summary || profile.message?.slice(0, 180)}{!profile.summary && (profile.message?.length ?? 0) > 180 ? "…" : ""}</p><Link className="text-link" href={`/leadership#profile-${profile.id}`}>Read full message <span aria-hidden="true">↗</span></Link></div></article>)}</div>;
}

export function LeadershipPreview({ profiles }: { profiles: LeadershipProfile[] }) {
  if (!profiles.length) return null;
  return <section className="leadership-section container" aria-labelledby="leadership-heading"><div className="section-heading"><div><p className="eyebrow">Leadership & Management</p><h2 id="leadership-heading">Guiding our<br /><em>school community.</em></h2></div><Link className="text-link" href="/leadership">Meet our leadership ↗</Link></div><LeadershipCards profiles={profiles.slice(0, 3)} /></section>;
}

export function LeadershipMessage({ profile }: { profile: LeadershipProfile }) {
  return <article id={`profile-${profile.id}`} className="leadership-message"><LeadershipPortrait profile={profile} /><div><p className="eyebrow">{profile.designation}</p><h2>{profile.fullName}</h2>{profile.message?.split(/\r?\n\s*\r?\n/).map((paragraph, index) => <p className="leadership-paragraph" key={index}>{paragraph}</p>)}</div></article>;
}
