import Image from "next/image";

export default function Loading() {
  return <main className="system-page" aria-live="polite"><Image className="system-logo" src="/school-logo.png" alt="St. Thomas English School, Ruabandha, Bhilai. logo" width={72} height={72} priority /><p className="eyebrow">Loading</p><h1>Preparing the<br /><em>school website.</em></h1><div className="loading-line" /></main>;
}
