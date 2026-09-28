"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { $Enums } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isSafeMediaReference } from "@/lib/media-validation";
import { removeReplacedMedia } from "@/lib/media-cleanup";

async function requireAdmin() {
	if (!(await auth())?.user) redirect("/admin/login");
}

function text(formData: FormData, name: string) {
	const value = formData.get(name);
	return typeof value === "string" ? value.trim() : "";
}

function optionalText(formData: FormData, name: string) {
	return text(formData, name) || null;
}

function statusValue(formData: FormData): $Enums.PublicationStatus {
	const value = text(formData, "status");
	if (value === "DRAFT" || value === "UNPUBLISHED") return value;
	return $Enums.PublicationStatus.PUBLISHED;
}

export async function saveFaculty(formData: FormData) {
	await requireAdmin();
	const id = text(formData, "id");
	const fullName = text(formData, "fullName");
	const designation = text(formData, "designation");
	const category = text(formData, "category");
	const photoUrl = optionalText(formData, "photoUrl");
	const photoKey = optionalText(formData, "photoKey");
	const photoAlt = optionalText(formData, "photoAlt");
	const allowedCategories = Object.values($Enums.FacultyCategory);

	if (!fullName || !designation || !allowedCategories.includes(category as $Enums.FacultyCategory)) {
		redirect(`/admin/faculty?error=required${id ? `&edit=${encodeURIComponent(id)}` : ""}`);
	}
	if (fullName.length > 160 || designation.length > 160 || (photoAlt?.length ?? 0) > 240 || !isSafeMediaReference(photoUrl, photoKey)) {
		redirect(`/admin/faculty?error=invalid${id ? `&edit=${encodeURIComponent(id)}` : ""}`);
	}

	const data = {
		fullName,
		designation,
		department: optionalText(formData, "department"),
		subject: optionalText(formData, "subject"),
		qualification: optionalText(formData, "qualification"),
		photoUrl,
		photoKey,
		photoAlt,
		category: category as $Enums.FacultyCategory,
		status: statusValue(formData),
	};

	if (id) {
		const existing = await prisma.facultyMember.findUnique({ where: { id }, select: { photoKey: true } });
		await prisma.facultyMember.update({ where: { id }, data });
		await removeReplacedMedia(existing?.photoKey ?? null, photoKey);
	} else await prisma.facultyMember.create({ data });

	revalidatePath("/admin/faculty");
	revalidatePath("/administration/faculty-staff");
	redirect(`/admin/faculty?status=${id ? "updated" : "created"}`);
}

export async function deleteFaculty(formData: FormData) {
	await requireAdmin();
	const id = text(formData, "id");
	if (id) {
		const existing = await prisma.facultyMember.findUnique({ where: { id }, select: { photoKey: true } });
		await prisma.facultyMember.delete({ where: { id } });
		await removeReplacedMedia(existing?.photoKey ?? null, null);
	}
	revalidatePath("/admin/faculty");
	revalidatePath("/administration/faculty-staff");
	redirect("/admin/faculty?status=deleted");
}

export async function saveFacility(formData: FormData) {
	await requireAdmin();
	const id = text(formData, "id");
	const name = text(formData, "name");
	const category = text(formData, "category") || name;
	const imageUrl = optionalText(formData, "imageUrl");
	const imageKey = optionalText(formData, "imageKey");
	const imageAlt = optionalText(formData, "imageAlt");
	if (!name) redirect(`/admin/facilities?error=required${id ? `&edit=${encodeURIComponent(id)}` : ""}`);
	if (name.length > 160 || category.length > 120 || (imageAlt?.length ?? 0) > 240 || !isSafeMediaReference(imageUrl, imageKey)) {
		redirect(`/admin/facilities?error=invalid${id ? `&edit=${encodeURIComponent(id)}` : ""}`);
	}

	const data = {
		name,
		category,
		description: optionalText(formData, "description"),
		imageUrl,
		imageKey,
		imageAlt,
		status: statusValue(formData),
	};
	if (id) {
		const existing = await prisma.facility.findUnique({ where: { id }, select: { imageKey: true } });
		await prisma.facility.update({ where: { id }, data });
		await removeReplacedMedia(existing?.imageKey ?? null, imageKey);
	} else await prisma.facility.create({ data });

	revalidatePath("/admin/facilities");
	revalidatePath("/academics/facilities");
	redirect(`/admin/facilities?status=${id ? "updated" : "created"}`);
}

export async function deleteFacility(formData: FormData) {
	await requireAdmin();
	const id = text(formData, "id");
	if (id) {
		const existing = await prisma.facility.findUnique({ where: { id }, select: { imageKey: true } });
		await prisma.facility.delete({ where: { id } });
		await removeReplacedMedia(existing?.imageKey ?? null, null);
	}
	revalidatePath("/admin/facilities");
	revalidatePath("/academics/facilities");
	redirect("/admin/facilities?status=deleted");
}

export async function updatePrincipal(formData: FormData) {
	await requireAdmin();
	const principalName = text(formData, "principalName");
	const principalDesignation = text(formData, "principalDesignation");
	const principalMessage = text(formData, "principalMessage");
	const principalPhotoUrl = optionalText(formData, "principalPhotoUrl");
	const principalPhotoKey = optionalText(formData, "principalPhotoKey");
	const principalPhotoAlt = optionalText(formData, "principalPhotoAlt");
	if (!principalName || !principalDesignation || !principalMessage) redirect("/admin/principal?error=required");
	if (principalName.length > 160 || principalDesignation.length > 160 || principalMessage.length > 12000 || (principalPhotoAlt?.length ?? 0) > 240 || !isSafeMediaReference(principalPhotoUrl, principalPhotoKey)) {
		redirect("/admin/principal?error=invalid");
	}

	const previous = await prisma.schoolSetting.findUnique({ where: { id: "school" }, select: { principalPhotoKey: true } });
	await prisma.schoolSetting.upsert({
		where: { id: "school" },
		create: { id: "school", principalName, principalDesignation, principalMessage, principalPhotoUrl, principalPhotoKey, principalPhotoAlt },
		update: { principalName, principalDesignation, principalMessage, principalPhotoUrl, principalPhotoKey, principalPhotoAlt },
	});
	await removeReplacedMedia(previous?.principalPhotoKey ?? null, principalPhotoKey);
	for (const path of ["/", "/administration/principal", "/about/principal-message"]) revalidatePath(path);
	redirect("/admin/principal?status=saved");
}

export async function updateSportsMessage(formData: FormData) {
	await requireAdmin();
	const sportsMessageAuthorName = text(formData, "sportsMessageAuthorName");
	const sportsMessageAuthorRole = optionalText(formData, "sportsMessageAuthorRole");
	const sportsMessage = text(formData, "sportsMessage");
	if (!sportsMessageAuthorName || !sportsMessage) redirect("/admin/sports?error=required");
	if (sportsMessageAuthorName.length > 160 || (sportsMessageAuthorRole?.length ?? 0) > 160 || sportsMessage.length > 12000) {
		redirect("/admin/sports?error=invalid");
	}

	await prisma.schoolSetting.upsert({
		where: { id: "school" },
		create: { id: "school", sportsMessageAuthorName, sportsMessageAuthorRole, sportsMessage },
		update: { sportsMessageAuthorName, sportsMessageAuthorRole, sportsMessage },
	});
	revalidatePath("/academics/sports");
	redirect("/admin/sports?status=message-saved");
}