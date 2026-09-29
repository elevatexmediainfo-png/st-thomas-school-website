"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { removeReplacedMedia } from "@/lib/media-cleanup";
import { isSafeMediaReference } from "@/lib/media-validation";
import { prisma } from "@/lib/prisma";

const limits = {
	schoolName: 160,
	location: 250,
	vision: 5000,
	mission: 5000,
	history: 12000,
} as const;

const optional = (formData: FormData, name: string) => {
	const entry = formData.get(name);
	return typeof entry === "string" && entry.trim() ? entry.trim() : null;
};

export async function updateSchoolInformation(formData: FormData) {
	if (!(await auth())?.user) redirect("/admin/login");

	const value = (name: keyof typeof limits) => {
		const entry = formData.get(name);
		return typeof entry === "string" ? entry.trim() : "";
	};
	const schoolName = value("schoolName");
	const location = value("location");
	const vision = value("vision");
	const mission = value("mission");
	const history = value("history");
	const values = { schoolName, location, vision, mission, history };
	const media = {
		heroImageUrl: optional(formData, "heroImageUrl"), heroImageKey: optional(formData, "heroImageKey"), heroImageAlt: optional(formData, "heroImageAlt"),
		introImageUrl: optional(formData, "introImageUrl"), introImageKey: optional(formData, "introImageKey"), introImageAlt: optional(formData, "introImageAlt"),
		galleryImageOneUrl: optional(formData, "galleryImageOneUrl"), galleryImageOneKey: optional(formData, "galleryImageOneKey"), galleryImageOneAlt: optional(formData, "galleryImageOneAlt"),
		galleryImageTwoUrl: optional(formData, "galleryImageTwoUrl"), galleryImageTwoKey: optional(formData, "galleryImageTwoKey"), galleryImageTwoAlt: optional(formData, "galleryImageTwoAlt"),
		galleryImageThreeUrl: optional(formData, "galleryImageThreeUrl"), galleryImageThreeKey: optional(formData, "galleryImageThreeKey"), galleryImageThreeAlt: optional(formData, "galleryImageThreeAlt"),
		galleryImageFourUrl: optional(formData, "galleryImageFourUrl"), galleryImageFourKey: optional(formData, "galleryImageFourKey"), galleryImageFourAlt: optional(formData, "galleryImageFourAlt"),
		galleryImageFiveUrl: optional(formData, "galleryImageFiveUrl"), galleryImageFiveKey: optional(formData, "galleryImageFiveKey"), galleryImageFiveAlt: optional(formData, "galleryImageFiveAlt"),
	};
	const mediaPairs = [
		[media.heroImageUrl, media.heroImageKey, media.heroImageAlt], [media.introImageUrl, media.introImageKey, media.introImageAlt],
		[media.galleryImageOneUrl, media.galleryImageOneKey, media.galleryImageOneAlt], [media.galleryImageTwoUrl, media.galleryImageTwoKey, media.galleryImageTwoAlt],
		[media.galleryImageThreeUrl, media.galleryImageThreeKey, media.galleryImageThreeAlt], [media.galleryImageFourUrl, media.galleryImageFourKey, media.galleryImageFourAlt],
		[media.galleryImageFiveUrl, media.galleryImageFiveKey, media.galleryImageFiveAlt],
	];

	if (Object.values(values).some((entry) => !entry)) {
		redirect("/admin/school-information?error=required");
	}
	if (Object.entries(values).some(([key, entry]) => entry.length > limits[key as keyof typeof limits])) {
		redirect("/admin/school-information?error=too-long");
	}
	if (mediaPairs.some(([url, key, alt]) => !isSafeMediaReference(url, key) || (alt?.length ?? 0) > 240)) {
		redirect("/admin/school-information?error=invalid-media");
	}

	const previous = await prisma.schoolSetting.findUnique({ where: { id: "school" }, select: { heroImageKey: true, introImageKey: true, galleryImageOneKey: true, galleryImageTwoKey: true, galleryImageThreeKey: true, galleryImageFourKey: true, galleryImageFiveKey: true } });
	const data = { schoolName, address: location, vision, mission, schoolHistory: history, ...media };
	await prisma.schoolSetting.upsert({ where: { id: "school" }, create: { id: "school", ...data }, update: data });
	for (const [oldKey, newKey] of [
		[previous?.heroImageKey, media.heroImageKey], [previous?.introImageKey, media.introImageKey], [previous?.galleryImageOneKey, media.galleryImageOneKey],
		[previous?.galleryImageTwoKey, media.galleryImageTwoKey], [previous?.galleryImageThreeKey, media.galleryImageThreeKey], [previous?.galleryImageFourKey, media.galleryImageFourKey], [previous?.galleryImageFiveKey, media.galleryImageFiveKey],
	] as Array<[string | null | undefined, string | null]>) await removeReplacedMedia(oldKey ?? null, newKey);

	for (const path of ["/", "/about", "/about/vision-mission", "/contact"]) revalidatePath(path);
	redirect("/admin/school-information?status=saved");
}