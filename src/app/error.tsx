"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <main className="system-page"><Image className="system-logo" src="/school-logo.png" alt="St. Thomas English School, Ruabandha, Bhilai. logo" width={72} height={72} priority /><p className="eyebrow">Something went wrong</p><h1>We&apos;re taking<br /><em>a moment.</em></h1><p>Please try again or return to the school homepage.</p><div className="system-page-actions"><button className="button button-dark" type="button" onClick={() => reset()}>Try again <span aria-hidden="true">↻</span></button><Link className="button button-outline-dark" href="/">Return home <span aria-hidden="true">↗</span></Link></div></main>;
}
