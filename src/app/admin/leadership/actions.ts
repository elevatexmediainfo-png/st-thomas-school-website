"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireLeadershipAdmin, revalidateLeadership } from "@/lib/leadership-admin";
import { validateLeadership, type LeadershipStatus } from "@/lib/leadership-validation";
import { isSafeMediaReference } from "@/lib/media-validation";
import { isTrustedMediaUrl } from "@/lib/media-storage";
import { removeReplacedMedia } from "@/lib/media-cleanup";

const text = (f: FormData, key: string) => typeof f.get(key) === "string" ? String(f.get(key)).trim() : "";
function fail(message: string): never { redirect(`/admin/leadership?error=${encodeURIComponent(message)}`); }

export async function saveLeadership(f: FormData) {
  await requireLeadershipAdmin();
  const id = text(f, "id");
  const fullName = text(f, "fullName"), designation = text(f, "designation"), message = text(f, "message"), summary = text(f, "summary"), status = text(f, "status"), sortOrder = text(f, "sortOrder"), photoAlt = text(f, "photoAlt");
  const error = validateLeadership({ fullName, designation, message, summary, status, sortOrder, photoAlt });
  if (error) fail(error);
  const photoUrl = text(f, "photoUrl") || null, photoKey = text(f, "photoKey") || null;
  if (!isSafeMediaReference(photoUrl, photoKey) || (photoKey && !isTrustedMediaUrl(photoUrl!, photoKey))) fail("Invalid photograph reference.");
  const role = text(f, "systemRole");
  if (role && role !== "CHAIRMAN" && role !== "MANAGER") fail("Invalid leadership role.");
  const data = { fullName, designation, message: message || null, summary: summary || null, status: status as LeadershipStatus, sortOrder: Number(sortOrder), photoUrl, photoKey, photoAlt: photoAlt || null };
  let previousKey: string | null = null;
  try {
    if (id) {
      if (Number.isNaN(Date.parse(text(f, "version")))) fail("Reload the editor before saving.");
      const previous = await prisma.leadershipMember.findUnique({ where: { id } });
      if (!previous) fail("Profile no longer exists.");
      previousKey = previous.photoKey;
      const result = await prisma.leadershipMember.updateMany({ where: { id, updatedAt: new Date(text(f, "version")) }, data });
      if (!result.count) fail("This profile changed. Reload before saving again.");
    } else {
      await prisma.leadershipMember.create({ data: { ...data, systemRole: role as "CHAIRMAN" | "MANAGER" || null } });
    }
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") fail("That default position already exists. Edit its existing profile.");
    throw error;
  }
  await removeReplacedMedia(previousKey, photoKey);
  revalidateLeadership();
  redirect("/admin/leadership?status=saved");
}

export async function deleteLeadership(f: FormData) {
  await requireLeadershipAdmin();
  if (Number.isNaN(Date.parse(text(f, "version")))) fail("Reload the editor before deleting.");
  const id = text(f, "id");
  const previous = await prisma.leadershipMember.findUnique({ where: { id } });
  if (!previous) fail("Profile no longer exists.");
  if (previous.systemRole) fail("Default positions can be unpublished, not deleted.");
  const result = await prisma.leadershipMember.deleteMany({ where: { id, updatedAt: new Date(text(f, "version")) } });
  if (!result.count) fail("This profile changed. Reload before deleting.");
  await removeReplacedMedia(previous.photoKey, null);
  revalidateLeadership();
  redirect("/admin/leadership?status=deleted");
}
