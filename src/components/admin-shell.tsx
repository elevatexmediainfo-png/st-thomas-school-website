import Link from "next/link";
import Image from "next/image";
import { AdminSignOut } from "@/components/admin-sign-out";
import { AdminNavigation } from "@/components/admin-navigation";
import { auth } from "@/auth";

export async function AdminShell({ children, title, description }: { children: React.ReactNode; title: string; description?: string }) {
  const session = await auth();
  return <div className="admin-panel"><aside className="admin-sidebar"><Link className="admin-sidebar-brand" href="/admin"><Image className="brand-logo" src="/school-logo.png" alt="St. Thomas English School, Ruabandha, Bhilai. logo" width={48} height={48} /><span><strong>St. Thomas English School, Ruabandha, Bhilai.</strong><small>Administration</small></span></Link><AdminNavigation canManageSettings={session?.user.role === "SUPER_ADMIN"} /></aside><main className="admin-main"><header className="admin-main-header"><div className="admin-main-heading"><Image className="admin-header-logo" src="/school-logo.png" alt="" width={54} height={54} /><div><p className="eyebrow">Admin panel</p><h1>{title}</h1>{description && <p>{description}</p>}</div></div><div className="admin-header-actions"><div className="admin-user-info"><strong>{session?.user.name || "Administrator"}</strong><span>{session?.user.email}</span><small>{session?.user.role === "SUPER_ADMIN" ? "Super administrator" : "Content administrator"}</small></div><Link className="admin-header-home" href="/">View website</Link><AdminSignOut /></div></header>{children}</main></div>;
}

export function AdminTableEmpty({ message }: { message: string }) {
  return <div className="admin-empty"><strong>No records yet</strong><p>{message}</p></div>;
}
