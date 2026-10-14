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
	const previous = await prisma.schoolSetting.findUnique({
		where: { id: "school" },
		select: {
			heroImageUrl: true, heroImageKey: true, heroImageAlt: true,
			introImageUrl: true, introImageKey: true, introImageAlt: true,
			principalPhotoUrl: true, principalPhotoKey: true, principalPhotoAlt: true,
			galleryImageOneUrl: true, galleryImageOneKey: true, galleryImageOneAlt: true,
			galleryImageTwoUrl: true, galleryImageTwoKey: true, galleryImageTwoAlt: true,
			galleryImageThreeUrl: true, galleryImageThreeKey: true, galleryImageThreeAlt: true,
			galleryImageFourUrl: true, galleryImageFourKey: true, galleryImageFourAlt: true,
			galleryImageFiveUrl: true, galleryImageFiveKey: true, galleryImageFiveAlt: true,
		},
	});

	const fieldOrPrevious = (name: string, fallback: string | null = null) => {
		if (!formData.has(name)) return fallback;
		const entry = formData.get(name);
		return typeof entry === "string" && entry.trim() ? entry.trim() : null;
	};

	const media = {
		heroImageUrl: fieldOrPrevious("heroImageUrl", previous?.heroImageUrl ?? null),
		heroImageKey: fieldOrPrevious("heroImageKey", previous?.heroImageKey ?? null),
		heroImageAlt: fieldOrPrevious("heroImageAlt", previous?.heroImageAlt ?? null),
		introImageUrl: fieldOrPrevious("introImageUrl", previous?.introImageUrl ?? null),
		introImageKey: fieldOrPrevious("introImageKey", previous?.introImageKey ?? null),
		introImageAlt: fieldOrPrevious("introImageAlt", previous?.introImageAlt ?? null),
		principalPhotoUrl: fieldOrPrevious("principalPhotoUrl", previous?.principalPhotoUrl ?? null),
		principalPhotoKey: fieldOrPrevious("principalPhotoKey", previous?.principalPhotoKey ?? null),
		principalPhotoAlt: fieldOrPrevious("principalPhotoAlt", previous?.principalPhotoAlt ?? null),
		galleryImageOneUrl: fieldOrPrevious("galleryImageOneUrl", previous?.galleryImageOneUrl ?? null),
		galleryImageOneKey: fieldOrPrevious("galleryImageOneKey", previous?.galleryImageOneKey ?? null),
		galleryImageOneAlt: fieldOrPrevious("galleryImageOneAlt", previous?.galleryImageOneAlt ?? null),
		galleryImageTwoUrl: fieldOrPrevious("galleryImageTwoUrl", previous?.galleryImageTwoUrl ?? null),
		galleryImageTwoKey: fieldOrPrevious("galleryImageTwoKey", previous?.galleryImageTwoKey ?? null),
		galleryImageTwoAlt: fieldOrPrevious("galleryImageTwoAlt", previous?.galleryImageTwoAlt ?? null),
		galleryImageThreeUrl: fieldOrPrevious("galleryImageThreeUrl", previous?.galleryImageThreeUrl ?? null),
		galleryImageThreeKey: fieldOrPrevious("galleryImageThreeKey", previous?.galleryImageThreeKey ?? null),
		galleryImageThreeAlt: fieldOrPrevious("galleryImageThreeAlt", previous?.galleryImageThreeAlt ?? null),
		galleryImageFourUrl: fieldOrPrevious("galleryImageFourUrl", previous?.galleryImageFourUrl ?? null),
		galleryImageFourKey: fieldOrPrevious("galleryImageFourKey", previous?.galleryImageFourKey ?? null),
		galleryImageFourAlt: fieldOrPrevious("galleryImageFourAlt", previous?.galleryImageFourAlt ?? null),
		galleryImageFiveUrl: fieldOrPrevious("galleryImageFiveUrl", previous?.galleryImageFiveUrl ?? null),
		galleryImageFiveKey: fieldOrPrevious("galleryImageFiveKey", previous?.galleryImageFiveKey ?? null),
		galleryImageFiveAlt: fieldOrPrevious("galleryImageFiveAlt", previous?.galleryImageFiveAlt ?? null),
	};
	const mediaPairs = [
		[media.heroImageUrl, media.heroImageKey, media.heroImageAlt], [media.introImageUrl, media.introImageKey, media.introImageAlt],
		[media.principalPhotoUrl, media.principalPhotoKey, media.principalPhotoAlt],
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

	const data = { schoolName, address: location, vision, mission, schoolHistory: history, ...media };
	await prisma.schoolSetting.upsert({ where: { id: "school" }, create: { id: "school", ...data }, update: data });
	for (const [oldKey, newKey] of [
		[previous?.heroImageKey, media.heroImageKey], [previous?.introImageKey, media.introImageKey], [previous?.principalPhotoKey, media.principalPhotoKey], [previous?.galleryImageOneKey, media.galleryImageOneKey],
		[previous?.galleryImageTwoKey, media.galleryImageTwoKey], [previous?.galleryImageThreeKey, media.galleryImageThreeKey], [previous?.galleryImageFourKey, media.galleryImageFourKey], [previous?.galleryImageFiveKey, media.galleryImageFiveKey],
	] as Array<[string | null | undefined, string | null]>) await removeReplacedMedia(oldKey ?? null, newKey);

	for (const path of ["/", "/about", "/about/vision-mission", "/about/principal-message", "/administration/principal", "/contact"]) revalidatePath(path);
	redirect("/admin/school-information?status=saved");
}