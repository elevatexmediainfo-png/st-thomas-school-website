import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin-shell";
import { ContentFeedback, NoticeForm } from "@/components/admin-content-forms";

export default async function EditNoticePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ id }, feedback] = await Promise.all([params, searchParams]);
  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice || notice.type !== "NOTICE") notFound();
  return <AdminShell title="Edit notice" description="Update and publish this notice when it is ready."><ContentFeedback error={feedback.error} /><NoticeForm notice={notice} type="NOTICE" /></AdminShell>;
}
