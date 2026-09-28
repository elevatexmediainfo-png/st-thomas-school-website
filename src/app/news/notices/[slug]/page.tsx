import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedNotice, NoticeDetailPage } from "@/components/news-events-pages";

type NoticeRouteProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: NoticeRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const notice = await getPublishedNotice(slug);
  return { title: notice ? `${notice.title} | Notices` : "Notice | St. Thomas English School, Ruabandha, Bhilai.", description: notice?.description ?? "Published school notice detail." };
}

export default async function NoticeDetailRoute({ params }: NoticeRouteProps) {
  const { slug } = await params;
  const notice = await getPublishedNotice(slug);
  if (!notice) notFound();
  return <NoticeDetailPage notice={notice} />;
}
