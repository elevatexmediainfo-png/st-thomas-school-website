import { NextResponse } from "next/server";
import { guardAdminRequest, readJson } from "@/lib/admin-api";
import { galleryImageSelect, galleryStatuses, galleryTextLimit, revalidateGallery } from "@/lib/gallery-images";
import { isManagedMediaKey, isTrustedMediaUrl } from "@/lib/media-storage";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const maxItemsPerRequest = 30;
type Context = { params: Promise<{ albumId: string }> };

const albumExists = async (albumId: string) => Boolean(await prisma.galleryAlbum.findUnique({ where: { id: albumId }, select: { id: true } }));
const orderBy = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }];

export async function GET(request: Request, { params }: Context) {
  const denied = await guardAdminRequest(request, { checkOrigin: false });
  if (denied) return denied;
  const { albumId } = await params;
  if (!(await albumExists(albumId))) return NextResponse.json({ error: "Album not found." }, { status: 404 });
  const images = await prisma.galleryPhoto.findMany({ where: { albumId }, select: galleryImageSelect, orderBy });
  return NextResponse.json({ images });
}

// Associates already-uploaded media (from /api/admin/media) with an album.
export async function POST(request: Request, { params }: Context) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  const { albumId } = await params;
  if (!(await albumExists(albumId))) return NextResponse.json({ error: "Album not found." }, { status: 404 });

  const body = await readJson(request);
  const items = body?.items;
  if (!Array.isArray(items) || items.length < 1 || items.length > maxItemsPerRequest) return NextResponse.json({ error: `Send between 1 and ${maxItemsPerRequest} images.` }, { status: 400 });

  const records: { albumId: string; imageKey: string; imageUrl: string; altText: string | null; caption: string | null }[] = [];
  for (const item of items) {
    const entry = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
    const imageKey = typeof entry.imageKey === "string" ? entry.imageKey : "";
    const imageUrl = typeof entry.imageUrl === "string" ? entry.imageUrl : "";
    const altText = typeof entry.altText === "string" ? entry.altText.trim() : "";
    const caption = typeof entry.caption === "string" ? entry.caption.trim() : "";
    if (!isManagedMediaKey(imageKey) || !isTrustedMediaUrl(imageUrl, imageKey)) return NextResponse.json({ error: "Invalid uploaded image reference." }, { status: 400 });
    if (altText.length > galleryTextLimit || caption.length > galleryTextLimit) return NextResponse.json({ error: `Caption and alt text must be ${galleryTextLimit} characters or fewer.` }, { status: 400 });
    records.push({ albumId, imageKey, imageUrl, altText: altText || null, caption: caption || null });
  }

  const keys = records.map((record) => record.imageKey);
  if (new Set(keys).size !== keys.length || (await prisma.galleryPhoto.count({ where: { imageKey: { in: keys } } })) > 0) return NextResponse.json({ error: "One or more images are already in a gallery." }, { status: 409 });

  const last = await prisma.galleryPhoto.aggregate({ where: { albumId }, _max: { sortOrder: true } });
  const start = (last._max.sortOrder ?? -1) + 1;
  const images = await prisma.$transaction(records.map((record, index) => prisma.galleryPhoto.create({ data: { ...record, sortOrder: start + index, status: galleryStatuses[0] }, select: galleryImageSelect })));
  revalidateGallery(albumId);
  return NextResponse.json({ images }, { status: 201 });
}

// Persists a new order: body is { ids: string[] } containing every image of the album.
export async function PUT(request: Request, { params }: Context) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  const { albumId } = await params;
  const body = await readJson(request);
  const ids = body?.ids;
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) return NextResponse.json({ error: "Invalid order." }, { status: 400 });

  const existing = await prisma.galleryPhoto.findMany({ where: { albumId }, select: { id: true } });
  const known = new Set(existing.map((image) => image.id));
  if (ids.length !== known.size || new Set(ids).size !== ids.length || ids.some((id) => !known.has(id))) return NextResponse.json({ error: "The image list is out of date. Reload and try again." }, { status: 409 });

  await prisma.$transaction((ids as string[]).map((id, index) => prisma.galleryPhoto.update({ where: { id }, data: { sortOrder: index } })));
  revalidateGallery(albumId);
  const images = await prisma.galleryPhoto.findMany({ where: { albumId }, select: galleryImageSelect, orderBy });
  return NextResponse.json({ images });
}
