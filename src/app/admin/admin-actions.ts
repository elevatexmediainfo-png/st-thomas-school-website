"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { $Enums } from "@/generated/prisma/client";
import { isSafeMediaReference } from "@/lib/media-validation";
import { removeReplacedMedia } from "@/lib/media-cleanup";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session;
}

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: FormDataEntryValue | null) {
  const valueText = text(value);
  return valueText || null;
}

function asDate(value: FormDataEntryValue | null) {
  const valueText = text(value);
  if (!valueText) return null;
  const date = new Date(valueText);
  return Number.isNaN(date.getTime()) ? null : date;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function noticePath(type: $Enums.NoticeType) {
  return type === $Enums.NoticeType.NEWS ? "/admin/news" : "/admin/notices";
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function createNotice(formData: FormData) {
  await requireAdmin();
  const type = text(formData.get("contentType")) === "NEWS" ? $Enums.NoticeType.NEWS : $Enums.NoticeType.NOTICE;
  const path = noticePath(type);
  const title = text(formData.get("title"));
  const category = text(formData.get("category"));
  const dateText = text(formData.get("publishDate"));
  const publishDate = asDate(formData.get("publishDate"));
  const imageUrl = optionalText(formData.get("imageUrl"));
  const imageKey = optionalText(formData.get("imageKey"));
  const imageAlt = optionalText(formData.get("imageAlt"));
  if (!title || !category) redirect(`${path}?error=required`);
  if ((dateText && !publishDate) || title.length > 200 || category.length > 120 || (imageAlt?.length ?? 0) > 240 || !isSafeMediaReference(imageUrl, imageKey)) redirect(`${path}?error=invalid`);
  const data = {
    type,
    title,
    slug: slugify(text(formData.get("slug")) || title),
    description: optionalText(formData.get("description")),
    content: optionalText(formData.get("content")),
    category,
    imageUrl,
    imageKey,
    imageAlt,
    documentUrl: type === $Enums.NoticeType.NOTICE ? optionalText(formData.get("documentUrl")) : null,
    status: formData.get("published") === "on" ? "PUBLISHED" as const : "DRAFT" as const,
    isPinned: type === $Enums.NoticeType.NOTICE && formData.get("pinned") === "on",
    isArchived: type === $Enums.NoticeType.NOTICE && formData.get("archived") === "on",
    publishDate,
  };
  try {
    await prisma.notice.create({ data });
  } catch (error) {
    if (isUniqueConstraintError(error)) redirect(`${path}?error=duplicate-slug`);
    throw error;
  }
  for (const route of ["/", "/news", "/news/notices"]) revalidatePath(route);
  redirect(`${path}?result=created`);
}

export async function updateNotice(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"));
  const title = text(formData.get("title"));
  if (!id) redirect("/admin/notices?error=invalid");
  const existing = await prisma.notice.findUnique({ where: { id }, select: { type: true, slug: true, imageKey: true } });
  if (!existing) redirect("/admin/notices?error=not-found");
  const type = existing.type;
  const path = noticePath(type);
  const category = text(formData.get("category"));
  const dateText = text(formData.get("publishDate"));
  const publishDate = asDate(formData.get("publishDate"));
  const imageUrl = optionalText(formData.get("imageUrl"));
  const imageKey = optionalText(formData.get("imageKey"));
  const imageAlt = optionalText(formData.get("imageAlt"));
  if (!title || !category) redirect(`${path}/${encodeURIComponent(id)}/edit?error=required`);
  if ((dateText && !publishDate) || title.length > 200 || category.length > 120 || (imageAlt?.length ?? 0) > 240 || !isSafeMediaReference(imageUrl, imageKey)) redirect(`${path}/${encodeURIComponent(id)}/edit?error=invalid`);
  const data = {
    title,
    slug: slugify(text(formData.get("slug")) || title),
    description: optionalText(formData.get("description")),
    content: optionalText(formData.get("content")),
    category,
    imageUrl,
    imageKey,
    imageAlt,
    status: formData.get("published") === "on" ? "PUBLISHED" as const : "DRAFT" as const,
    publishDate,
    ...(type === $Enums.NoticeType.NOTICE ? {
      documentUrl: optionalText(formData.get("documentUrl")),
      isPinned: formData.get("pinned") === "on",
      isArchived: formData.get("archived") === "on",
    } : {}),
  };
  try {
    await prisma.notice.update({ where: { id }, data });
  } catch (error) {
    if (isUniqueConstraintError(error)) redirect(`${path}/${encodeURIComponent(id)}/edit?error=duplicate-slug`);
    throw error;
  }
  await removeReplacedMedia(existing.imageKey, imageKey);
  for (const route of ["/", "/news", "/news/notices"]) revalidatePath(route);
  if (existing.slug !== data.slug) {
    revalidatePath(type === $Enums.NoticeType.NEWS ? `/news/${existing.slug}` : `/news/notices/${existing.slug}`);
  }
  revalidatePath(type === $Enums.NoticeType.NEWS ? `/news/${data.slug}` : `/news/notices/${data.slug}`);
  redirect(`${path}?result=updated`);
}

export async function deleteNotice(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"));
  if (!id) return;
  const existing = await prisma.notice.findUnique({ where: { id }, select: { type: true, slug: true, imageKey: true } });
  if (!existing) return;
  await prisma.notice.delete({ where: { id } });
  await removeReplacedMedia(existing.imageKey, null);
  const path = noticePath(existing.type);
  for (const route of ["/", "/news", "/news/notices"]) revalidatePath(route);
  revalidatePath(existing.type === $Enums.NoticeType.NEWS ? `/news/${existing.slug}` : `/news/notices/${existing.slug}`);
  redirect(`${path}?result=deleted`);
}

export async function createEvent(formData: FormData) {
  await requireAdmin();
  const title = text(formData.get("title"));
  const category = text(formData.get("category"));
  const dateText = text(formData.get("eventDate"));
  const eventDate = asDate(formData.get("eventDate"));
  const imageUrl = optionalText(formData.get("imageUrl"));
  const imageKey = optionalText(formData.get("imageKey"));
  const imageAlt = optionalText(formData.get("imageAlt"));
  if (!title || !category) redirect("/admin/events?error=required");
  if ((dateText && !eventDate) || title.length > 200 || category.length > 120 || (imageAlt?.length ?? 0) > 240 || !isSafeMediaReference(imageUrl, imageKey)) redirect("/admin/events?error=invalid");
  try {
    const event = await prisma.event.create({ data: { title, slug: slugify(text(formData.get("slug")) || title), description: optionalText(formData.get("description")), eventDate, eventTime: optionalText(formData.get("eventTime")), venue: optionalText(formData.get("venue")), category, imageUrl, imageKey, imageAlt, status: text(formData.get("status")) === "PAST" ? "PAST" : "UPCOMING", isFeatured: formData.get("featured") === "on", publication: formData.get("published") === "on" ? "PUBLISHED" : "DRAFT" } });
    revalidatePath("/admin/events"); revalidatePath("/events"); revalidatePath(`/events/${event.slug}`); redirect("/admin/events?result=created");
  } catch (error) {
    if (isUniqueConstraintError(error)) redirect("/admin/events?error=duplicate-slug");
    throw error;
  }
}

export async function updateEvent(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"));
  const title = text(formData.get("title"));
  if (!id) redirect("/admin/events?error=invalid");
  const existing = await prisma.event.findUnique({ where: { id }, select: { slug: true, imageKey: true } });
  if (!existing) redirect("/admin/events?error=not-found");
  const category = text(formData.get("category"));
  const dateText = text(formData.get("eventDate"));
  const eventDate = asDate(formData.get("eventDate"));
  const imageUrl = optionalText(formData.get("imageUrl"));
  const imageKey = optionalText(formData.get("imageKey"));
  const imageAlt = optionalText(formData.get("imageAlt"));
  if (!title || !category) redirect(`/admin/events/${encodeURIComponent(id)}/edit?error=required`);
  if ((dateText && !eventDate) || title.length > 200 || category.length > 120 || (imageAlt?.length ?? 0) > 240 || !isSafeMediaReference(imageUrl, imageKey)) redirect(`/admin/events/${encodeURIComponent(id)}/edit?error=invalid`);
  const slug = slugify(text(formData.get("slug")) || title);
  try {
    await prisma.event.update({ where: { id }, data: { title, slug, description: optionalText(formData.get("description")), eventDate, eventTime: optionalText(formData.get("eventTime")), venue: optionalText(formData.get("venue")), category, imageUrl, imageKey, imageAlt, status: text(formData.get("status")) === "PAST" ? "PAST" : "UPCOMING", isFeatured: formData.get("featured") === "on", publication: formData.get("published") === "on" ? "PUBLISHED" : "DRAFT" } });
  } catch (error) {
    if (isUniqueConstraintError(error)) redirect(`/admin/events/${encodeURIComponent(id)}/edit?error=duplicate-slug`);
    throw error;
  }
  await removeReplacedMedia(existing.imageKey, imageKey);
  revalidatePath("/admin/events"); revalidatePath("/events");
  if (existing.slug !== slug) revalidatePath(`/events/${existing.slug}`);
  revalidatePath(`/events/${slug}`);
  redirect("/admin/events?result=updated");
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"));
  if (!id) return;
  const existing = await prisma.event.findUnique({ where: { id }, select: { slug: true, imageKey: true } });
  if (!existing) return;
  await prisma.event.delete({ where: { id } });
  await removeReplacedMedia(existing.imageKey, null);
  revalidatePath("/admin/events"); revalidatePath("/events"); revalidatePath(`/events/${existing.slug}`);
  redirect("/admin/events?result=deleted");
}
