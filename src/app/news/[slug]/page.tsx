import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedNews, NewsDetailPage } from "@/components/news-events-pages";

type NewsRouteProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: NewsRouteProps): Promise<Metadata> {
	const { slug } = await params;
	const news = await getPublishedNews(slug);
	return { title: news ? `${news.title} | News` : "News | St. Thomas English School, Ruabandha, Bhilai.", description: news?.description ?? "Published school news." };
}

export default async function NewsDetailRoute({ params }: NewsRouteProps) {
	const { slug } = await params;
	const news = await getPublishedNews(slug);
	if (!news) notFound();
	return <NewsDetailPage news={news} />;
}