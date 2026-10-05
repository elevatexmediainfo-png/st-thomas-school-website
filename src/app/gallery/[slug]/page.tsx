import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GalleryDetailPage } from "@/components/gallery-pages";
import { prisma } from "@/lib/prisma";

type GalleryRouteProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: GalleryRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const album = await prisma.galleryAlbum.findFirst({ where: { slug, status: "PUBLISHED" }, include: { photos: { where: { status: "PUBLISHED" }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } } });
  return { title: album ? `${album.title} | Gallery` : "Gallery album | St. Thomas English School, Ruabandha, Bhilai.", description: album?.description ?? "Gallery album placeholder." };
}

export default async function GalleryDetailRoute({ params }: GalleryRouteProps) {
  const { slug } = await params;
  const record = await prisma.galleryAlbum.findFirst({ where: { slug, status: "PUBLISHED" }, include: { photos: { where: { status: "PUBLISHED" }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } } });
  const album = record ? { id: record.id, slug: record.slug, title: record.title, category: record.category, description: record.description ?? "", date: record.albumDate?.toLocaleDateString() ?? "Date not set", coverImage: "Album cover placeholder", coverImageUrl: record.coverImage ?? record.photos.find((photo) => photo.imageUrl)?.imageUrl ?? null, coverImageAlt: record.coverImageAlt ?? record.photos.find((photo) => photo.imageUrl)?.altText ?? null, photos: record.photos.map((photo) => photo.imageUrl ?? ""), captions: record.photos.map((photo) => photo.caption ?? ""), photoAlts: record.photos.map((photo) => photo.altText ?? photo.caption ?? record.title), published: true } : null;
  if (!album) notFound();
  return <GalleryDetailPage album={album} />;
}
