import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return <main className="system-page"><Image className="system-logo" src="/school-logo.png" alt="St. Thomas English School, Ruabandha, Bhilai. logo" width={72} height={72} priority /><p className="eyebrow">Page not found</p><h1>This page is not<br /><em>available.</em></h1><p>The page you are looking for may have moved or is still being prepared.</p><Link className="button button-dark" href="/">Return home <span aria-hidden="true">↗</span></Link></main>;
}
