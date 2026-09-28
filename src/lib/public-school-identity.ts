import { cache } from "react";
import { connection } from "next/server";
import { schoolContent } from "@/content/home-content";
import { prisma } from "@/lib/prisma";

export const getPublicSchoolIdentity = cache(async () => {
	await connection();
	const settings = await prisma.schoolSetting.findUnique({
		where: { id: "school" },
		select: { schoolName: true, address: true },
	});

	return {
		schoolName: settings?.schoolName || schoolContent.schoolName,
		location: settings?.address || schoolContent.location,
	};
});