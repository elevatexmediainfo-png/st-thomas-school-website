"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="container leadership-section"><h1>Leadership editor unavailable</h1><p>Your changes may not have been saved. Reload before trying again.</p><button className="button button-dark" onClick={reset}>Reload editor</button></main>; }
