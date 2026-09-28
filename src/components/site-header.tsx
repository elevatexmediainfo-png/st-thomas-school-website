import Link from "next/link";
import Image from "next/image";
import { schoolContent } from "@/content/home-content";
import { getPublicSchoolIdentity } from "@/lib/public-school-identity";
import { SiteNavigation } from "@/components/site-navigation";

export async function SiteHeader() {
  const { schoolName, location } = await getPublicSchoolIdentity();
  return (
    <header className="site-header">
      <div className="topline">
        <div className="container top-line-inner">
          <p>{location} | {schoolContent.affiliation}</p>
          <div className="topline-links">
            <Link href="/downloads">Downloads</Link>
            <Link href="/contact">Contact office</Link>
          </div>
        </div>
      </div>
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label={`${schoolName} home`}>
          <Image className="brand-logo" src="/school-logo.png" alt={`${schoolName} logo`} width={52} height={52} priority />
          <span className="brand-copy">
            <strong>{schoolName}</strong>
            <span>{schoolContent.tagline}</span>
          </span>
        </Link>
        <SiteNavigation />
      </div>
    </header>
  );
}