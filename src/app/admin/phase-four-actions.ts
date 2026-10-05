"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { $Enums } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isSafeMediaReference } from "@/lib/media-validation";
import { removeReplacedMedia, removeUnreferencedGalleryMedia } from "@/lib/media-cleanup";

async function requireAdmin() {
	if (!(await auth())?.user) redirect("/admin/login");
}

const text = (form: FormData, key: string) => {
	const value = form.get(key);
	return typeof value === "string" ? value.trim() : "";
};
const optional = (form: FormData, key: string) => text(form, key) || null;
const publication = (form: FormData) => {
	const selected = text(form, "status");
	if (selected === "PUBLISHED" || selected === "DRAFT" || selected === "UNPUBLISHED") return selected as $Enums.PublicationStatus;
	return form.get("published") === "on" ? $Enums.PublicationStatus.PUBLISHED : $Enums.PublicationStatus.DRAFT;
};
const parseDate = (value: string) => {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date;
};
const lines = (value: string) => value.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean);
const jsonLines = (value: string) => lines(value);

export async function saveAchievement(form: FormData) {
	await requireAdmin();
	const id = text(form, "id");
	const title = text(form, "title");
	const category = text(form, "category");
	const achievementDateText = text(form, "achievementDate");
	const achievementDate = parseDate(achievementDateText);
	const imageUrl = optional(form, "imageUrl");
	const imageKey = optional(form, "imageKey");
	const imageAlt = optional(form, "imageAlt");
	if (!title || !category) redirect(`/admin/achievements?error=required${id ? `&edit=${encodeURIComponent(id)}` : ""}`);
	if (achievementDate === undefined || title.length > 200 || category.length > 100 || (imageAlt?.length ?? 0) > 240 || !isSafeMediaReference(imageUrl, imageKey)) redirect(`/admin/achievements?error=invalid${id ? `&edit=${encodeURIComponent(id)}` : ""}`);
	const yearText = text(form, "year");
	const year = yearText ? Number(yearText) : null;
	if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2200)) redirect(`/admin/achievements?error=invalid${id ? `&edit=${encodeURIComponent(id)}` : ""}`);
	const data = { title, category, studentName: optional(form, "studentName"), year, achievementDate: achievementDate ?? null, description: optional(form, "description"), imageUrl, imageKey, imageAlt, status: publication(form) };
	if (id) {
		const existing = await prisma.achievement.findUnique({ where: { id }, select: { imageKey: true } });
		await prisma.achievement.update({ where: { id }, data });
		await removeReplacedMedia(existing?.imageKey ?? null, imageKey);
	} else await prisma.achievement.create({ data });
	revalidatePath("/admin/achievements");
	revalidatePath("/achievements");
	redirect(`/admin/achievements?result=${id ? "updated" : "created"}`);
}

export async function deleteAchievement(form: FormData) {
	await requireAdmin();
	const id = text(form, "id");
	if (id) {
		const existing = await prisma.achievement.findUnique({ where: { id }, select: { imageKey: true } });
		await prisma.achievement.delete({ where: { id } });
		await removeReplacedMedia(existing?.imageKey ?? null, null);
	}
	revalidatePath("/admin/achievements");
	revalidatePath("/achievements");
	redirect("/admin/achievements?result=deleted");
}

export async function saveGalleryItem(form: FormData) {
	await requireAdmin();
	const albumId = text(form, "albumId");
	const id = text(form, "id");
	const caption = optional(form, "caption");
	const imageUrl = optional(form, "imageUrl");
	const imageKey = optional(form, "imageKey");
	const altText = optional(form, "altText");
	const sortOrder = Number(text(form, "sortOrder")) || 0;
	const status = publication(form);
	if (!albumId || !(await prisma.galleryAlbum.findUnique({ where: { id: albumId }, select: { id: true } }))) redirect("/admin/gallery?error=album-not-found");
	if ((altText?.length ?? 0) > 240 || !isSafeMediaReference(imageUrl, imageKey)) redirect(`/admin/gallery/${encodeURIComponent(albumId)}?error=invalid`);
	if (id) {
		const existing = await prisma.galleryPhoto.findUnique({ where: { id }, select: { imageKey: true } });
		await prisma.galleryPhoto.update({ where: { id }, data: { caption, sortOrder, status, imageUrl, imageKey, altText } });
		await removeUnreferencedGalleryMedia(existing?.imageKey && existing.imageKey !== imageKey ? existing.imageKey : null);
	} else await prisma.galleryPhoto.create({ data: { albumId, caption, sortOrder, status, imageUrl, imageKey, altText } });
	revalidatePath("/admin/gallery");
	revalidatePath(`/admin/gallery/${albumId}`);
	revalidatePath("/gallery");
	redirect(`/admin/gallery/${albumId}?result=${id ? "updated" : "created"}`);
}

export async function deleteGalleryItem(form: FormData) {
	await requireAdmin();
	const id = text(form, "id");
	const albumId = text(form, "albumId") || text(form, "model");
	if (id) {
		const existing = await prisma.galleryPhoto.findUnique({ where: { id }, select: { imageKey: true } });
		await prisma.galleryPhoto.delete({ where: { id } });
		await removeUnreferencedGalleryMedia(existing?.imageKey ?? null);
	}
	revalidatePath("/admin/gallery");
	if (albumId) revalidatePath(`/admin/gallery/${albumId}`);
	revalidatePath("/gallery");
	if (albumId) redirect(`/admin/gallery/${albumId}?result=deleted`);
	redirect("/admin/gallery?result=deleted");
}

export async function updateAdmissions(form: FormData) {
	await requireAdmin();
	const startDateText = text(form, "startDate");
	const endDateText = text(form, "endDate");
	const startDate = parseDate(startDateText);
	const endDate = parseDate(endDateText);
	if (startDate === undefined || endDate === undefined || (startDate && endDate && endDate < startDate)) redirect("/admin/admissions?error=dates");
	const availableClasses = jsonLines(text(form, "availableClasses"));
	const requiredDocuments = jsonLines(text(form, "requiredDocuments"));
	const admissionProcess = jsonLines(text(form, "admissionProcess"));
	const importantInstructions = jsonLines(text(form, "importantInstructions"));
	const data = {
		headline: optional(form, "headline"),
		introduction: optional(form, "introduction"),
		startDate: startDate ?? null,
		endDate: endDate ?? null,
		availableClasses,
		eligibility: optional(form, "eligibility"),
		requiredDocuments,
		admissionProcess,
		importantInstructions,
		isPublished: form.get("published") === "on",
	};
	await prisma.admissionSetting.upsert({ where: { id: "admissions" }, create: { id: "admissions", ...data }, update: data });
	revalidatePath("/admin/admissions");
	revalidatePath("/admissions");
	redirect("/admin/admissions?result=saved");
}

export async function setEnquiryStatus(form: FormData) {
	await requireAdmin();
	const id = text(form, "id");
	const status = text(form, "status");
	if (!id || !["NEW", "CONTACTED", "CLOSED"].includes(status)) redirect("/admin/admissions/enquiries?error=invalid");
	await prisma.enquiry.update({ where: { id }, data: { status: status as $Enums.EnquiryStatus } });
	revalidatePath("/admin/admissions/enquiries");
	redirect("/admin/admissions/enquiries?result=updated");
}

export async function removeEnquiry(form: FormData) {
	await requireAdmin();
	const id = text(form, "id");
	if (id) await prisma.enquiry.delete({ where: { id } });
	revalidatePath("/admin/admissions/enquiries");
	redirect("/admin/admissions/enquiries?result=deleted");
}

export async function saveContactInformation(form: FormData) {
	await requireAdmin();
	const email = optional(form, "email");
	const links = ["websiteUrl", "mapLink", "instagramUrl", "facebookUrl", "youtubeUrl"].map((key) => [key, optional(form, key)] as const);
	if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/admin/contact?error=email");
	for (const [key, value] of links) {
		if (!value) continue;
		try {
			const url = new URL(value);
			if (url.protocol !== "https:") redirect(`/admin/contact?error=${key}`);
		} catch {
			redirect(`/admin/contact?error=${key}`);
		}
	}
	const data = { schoolName: optional(form, "schoolName"), address: optional(form, "address"), phone: optional(form, "phone"), email, mapLink: optional(form, "mapLink"), websiteUrl: optional(form, "websiteUrl"), instagramUrl: optional(form, "instagramUrl"), facebookUrl: optional(form, "facebookUrl"), youtubeUrl: optional(form, "youtubeUrl") };
	await prisma.schoolSetting.upsert({ where: { id: "school" }, create: { id: "school", ...data }, update: data });
	for (const path of ["/", "/contact"]) revalidatePath(path);
	redirect("/admin/contact?result=saved");
}

export async function submitAdmissionEnquiry(form: FormData) {
	const applicantName = text(form, "guardianName");
	const studentName = text(form, "studentName");
	const phone = text(form, "phone").replace(/[\s()+-]/g, "");
	const email = text(form, "email").toLowerCase();
	const classApplyingFor = optional(form, "classGrade");
	const message = text(form, "message");
	if (text(form, "website")) return { success: true };
	if (!applicantName || !studentName || applicantName.length > 160 || studentName.length > 160 || !/^\d{10,15}$/.test(phone) || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (classApplyingFor?.length ?? 0) > 100 || !message || message.length > 5000) return { error: "Enter valid parent, student, contact, and message details." };
	await prisma.enquiry.create({ data: { applicantName, studentName, phone, email, classApplyingFor, enquiryType: "ADMISSION", message } });
	return { success: true };
}