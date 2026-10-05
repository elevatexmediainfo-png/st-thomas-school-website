import { NextResponse } from "next/server";
import { guardAdminRequest, readJson } from "@/lib/admin-api";
import { galleryImageSelect, galleryStatuses, galleryTextLimit, revalidateGallery } from "@/lib/gallery-images";
import { removeUnreferencedGalleryMedia } from "@/lib/media-cleanup";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
type Context = { params: Promise<{ albumId: string; imageId: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  const { albumId, imageId } = await params;
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const data: { caption?: string | null; altText?: string | null; status?: (typeof galleryStatuses)[number] } = {};
  for (const field of ["caption", "altText"] as const) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== "string" || body[field].trim().length > galleryTextLimit) return NextResponse.json({ error: `Caption and alt text must be ${galleryTextLimit} characters or fewer.` }, { status: 400 });
    data[field] = body[field].trim() || null;
  }
  if (body.status !== undefined) {
    const status = galleryStatuses.find((value) => value === body.status);
    if (!status) return NextResponse.json({ error: "Invalid publishing status." }, { status: 400 });
    data.status = status;
  }

  if (!(await prisma.galleryPhoto.findFirst({ where: { id: imageId, albumId }, select: { id: true } }))) return NextResponse.json({ error: "Image not found." }, { status: 404 });
  const image = await prisma.galleryPhoto.update({ where: { id: imageId }, data, select: galleryImageSelect });
  revalidateGallery(albumId);
  return NextResponse.json({ image });
}

export async function DELETE(request: Request, { params }: Context) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  const { albumId, imageId } = await params;
  const photo = await prisma.galleryPhoto.findFirst({ where: { id: imageId, albumId }, select: { id: true, imageKey: true } });
  if (!photo) return NextResponse.json({ error: "Image not found." }, { status: 404 });

  await prisma.$transaction([
    prisma.galleryPhoto.delete({ where: { id: photo.id } }),
    // Do not leave the album pointing at media that is about to be deleted.
    ...(photo.imageKey ? [prisma.galleryAlbum.updateMany({ where: { id: albumId, coverImageKey: photo.imageKey }, data: { coverImage: null, coverImageKey: null, coverImageAlt: null } })] : []),
  ]);
  // The stored key is the only identifier ever sent to Cloudinary; failures are reported, not fatal.
  const mediaCleanup = await removeUnreferencedGalleryMedia(photo.imageKey);
  revalidateGallery(albumId);
  return NextResponse.json({ success: true, mediaCleanup });
}
