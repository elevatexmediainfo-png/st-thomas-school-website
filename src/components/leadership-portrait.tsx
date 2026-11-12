"use client";
import { useState } from "react";
import Image from "next/image";

export function LeadershipPortrait({ profile }: { profile: { photoUrl: string | null; photoAlt: string | null; fullName: string } }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  return <div className="leadership-portrait">{profile.photoUrl && failedUrl !== profile.photoUrl ? <Image unoptimized src={profile.photoUrl} alt={profile.photoAlt || `Portrait of ${profile.fullName}`} loading="lazy" width={400} height={500} onError={() => setFailedUrl(profile.photoUrl)} /> : <span aria-label="Photograph unavailable">{profile.fullName.split(/\s+/).map(word => word[0]).slice(0, 2).join("")}</span>}</div>;
}
