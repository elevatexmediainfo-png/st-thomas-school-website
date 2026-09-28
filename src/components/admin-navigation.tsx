"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
	["Dashboard", "/admin"],
	["Website Content", "/admin/school-information"],
	["Principal", "/admin/principal"],
	["Academics", "/admin/academics"],
	["Facilities", "/admin/facilities"],
	["Faculty & Staff", "/admin/faculty"],
	["News", "/admin/news"],
	["Notices", "/admin/notices"],
	["Events", "/admin/events"],
	["Achievements", "/admin/achievements"],
	["Gallery", "/admin/gallery"],
	["Admissions", "/admin/admissions"],
	["Admission Enquiries", "/admin/admissions/enquiries"],
	["Contact", "/admin/contact"],
	["Settings", "/admin/settings"],
];

const existingToolLinks = [
	["School Calendar", "/admin/calendar"],
	["Subjects", "/admin/subjects"],
	["Academic Calendar", "/admin/academic-calendar"],
	["Co-curricular Activities", "/admin/co-curricular"],
	["Sports", "/admin/sports"],
	["Downloads", "/admin/downloads"],
];

export function AdminNavigation({ canManageSettings }: { canManageSettings: boolean }) {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);
	const visibleLinks = links.filter(([label]) => label !== "Settings" || canManageSettings);

	return <>
		<button className="admin-mobile-toggle" type="button" aria-expanded={isOpen} aria-controls="admin-navigation" onClick={() => setIsOpen((open) => !open)}>
			{isOpen ? "Close menu" : "Menu"}
		</button>
		<nav id="admin-navigation" className={isOpen ? "is-open" : ""} aria-label="Admin navigation">
			{visibleLinks.map(([label, href]) => <Link aria-current={pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)) ? "page" : undefined} href={href} key={href} onClick={() => setIsOpen(false)}>{label}</Link>)}
			<p className="admin-navigation-label">Other tools</p>
			{existingToolLinks.map(([label, href]) => <Link aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined} href={href} key={href} onClick={() => setIsOpen(false)}>{label}</Link>)}
		</nav>
	</>;
}