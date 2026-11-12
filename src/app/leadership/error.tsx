"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="container leadership-section"><h1>Leadership information is unavailable</h1><p>Please try again in a moment.</p><button className="button button-dark" onClick={reset}>Try again</button></main>; }
