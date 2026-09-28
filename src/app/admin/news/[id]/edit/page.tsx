import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ContentFeedback, NoticeForm } from "@/components/admin-content-forms";
import { prisma } from "@/lib/prisma";

export default async function EditNewsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
	const [{ id }, feedback] = await Promise.all([params, searchParams]);
	const news = await prisma.notice.findUnique({ where: { id } });
	if (!news || news.type !== "NEWS") notFound();
	return <AdminShell title="Edit news" description="Update and publish this school news item."><ContentFeedback error={feedback.error} /><NoticeForm notice={news} type="NEWS" /></AdminShell>;
}