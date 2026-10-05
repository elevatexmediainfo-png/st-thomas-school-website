import { NextResponse } from "next/server";
import { guardAdminRequest, readJson } from "@/lib/admin-api";
import { revalidateGallery } from "@/lib/gallery-images";
import { removeUnreferencedGalleryMedia } from "@/lib/media-cleanup";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ albumId: string }> }) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  const { albumId } = await params;
  const body = await readJson(request);
  const imageId = typeof body?.imageId === "string" ? body.imageId : "";

  const [album, photo] = await Promise.all([
    prisma.galleryAlbum.findUnique({ where: { id: albumId }, select: { coverImageKey: true } }),
    prisma.galleryPhoto.findFirst({ where: { id: imageId, albumId }, select: { imageUrl: true, imageKey: true, altText: true, caption: true } }),
  ]);
  if (!album || !photo || !photo.imageUrl || !photo.imageKey) return NextResponse.json({ error: "Image not found." }, { status: 404 });

  await prisma.galleryAlbum.update({ where: { id: albumId }, data: { coverImage: photo.imageUrl, coverImageKey: photo.imageKey, coverImageAlt: photo.altText ?? photo.caption } });
  if (album.coverImageKey && album.coverImageKey !== photo.imageKey) await removeUnreferencedGalleryMedia(album.coverImageKey);
  revalidateGallery(albumId);
  return NextResponse.json({ success: true, coverImageKey: photo.imageKey });
}
