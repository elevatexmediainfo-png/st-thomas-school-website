import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell, AdminTableEmpty } from "@/components/admin-shell";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const [facultyCount, facilityCount, newsCount, noticeCount, eventCount, albumCount, achievementCount, enquiryCount, notices, events, enquiries] = await Promise.all([prisma.facultyMember.count(), prisma.facility.count(), prisma.notice.count({ where: { type: "NEWS" } }), prisma.notice.count({ where: { type: "NOTICE" } }), prisma.event.count(), prisma.galleryAlbum.count(), prisma.achievement.count(), prisma.enquiry.count(), prisma.notice.findMany({ where: { type: "NOTICE" }, orderBy: { createdAt: "desc" }, take: 5 }), prisma.event.findMany({ where: { status: "UPCOMING" }, orderBy: { eventDate: "asc" }, take: 5 }), prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 })]);
  return <AdminShell title="Dashboard" description="A live overview of the school content database."><section className="admin-stat-grid">{[["Faculty & Staff", facultyCount, "/admin/faculty"], ["Facilities", facilityCount, "/admin/facilities"], ["News", newsCount, "/admin/news"], ["Notices", noticeCount, "/admin/notices"], ["Events", eventCount, "/admin/events"], ["Achievements", achievementCount, "/admin/achievements"], ["Gallery Albums", albumCount, "/admin/gallery"], ["Admission Enquiries", enquiryCount, "/admin/admissions/enquiries"]].map(([label, value, href]) => <Link className="admin-stat-card" href={href as string} key={label as string}><span>{label}</span><strong>{value}</strong><small>View module ↗</small></Link>)}</section><section className="admin-quick-actions"><p className="eyebrow">Quick actions</p><div>{[["Edit School Information", "/admin/school-information"], ["Add Notice", "/admin/notices/new"], ["Add Event", "/admin/events/new"], ["Create Gallery Album", "/admin/gallery/new"], ["View Enquiries", "/admin/admissions/enquiries"]].map(([label, href]) => <Link className="button button-outline-dark" href={href} key={href}>{label} <span aria-hidden="true">↗</span></Link>)}</div></section><div className="admin-dashboard-grid"><DashboardList title="Recent Notices" href="/admin/notices" items={notices.map((item) => item.title)} empty="No notices yet." /><DashboardList title="Upcoming Events" href="/admin/events" items={events.map((item) => item.title)} empty="No upcoming events." /><DashboardList title="Recent Enquiries" href="/admin/admissions/enquiries" items={enquiries.map((item) => item.applicantName)} empty="No enquiries yet." /></div></AdminShell>;
}

function DashboardList({ title, href, items, empty }: { title: string; href: string; items: string[]; empty: string }) {
  return <section className="admin-dashboard-card"><div><h2>{title}</h2><Link href={href}>View all ↗</Link></div>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <AdminTableEmpty message={empty} />}</section>;
}
