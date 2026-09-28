"use client";

import Link from "next/link";
import { useState } from "react";

const navigation = [
	{ label: "About", href: "/about" },
	{ label: "Academics", href: "/academics" },
	{ label: "Administration", href: "/administration" },
	{ label: "News & Notices", href: "/news" },
	{ label: "Events", href: "/events" },
	{ label: "Gallery", href: "/gallery" },
	{ label: "Contact", href: "/contact" },
];

export function SiteNavigation() {
	const [menuOpen, setMenuOpen] = useState(false);

	return <>
		<button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}>
			<span className="menu-icon" aria-hidden="true"><i /><i /><i /></span>
			<span className="sr-only">Toggle navigation</span>
		</button>
		<nav id="primary-navigation" className={`primary-nav ${menuOpen ? "is-open" : ""}`}>
			{navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
			<Link className="nav-cta" href="/admissions" onClick={() => setMenuOpen(false)}>Admissions <span aria-hidden="true">↗</span></Link>
		</nav>
	</>;
}