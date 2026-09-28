import { AdminShell } from "@/components/admin-shell";

export function AdminModulePlaceholder({ title, description }: { title: string; description: string }) {
  return <AdminShell title={title} description={description}><div className="admin-empty"><strong>This screen is planned for a later admin phase.</strong><p>Existing public content and database records remain unchanged.</p></div></AdminShell>;
}
