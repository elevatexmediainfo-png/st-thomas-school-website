"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
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

	if (Object.values(values).some((entry) => !entry)) {
		redirect("/admin/school-information?error=required");
	}
	if (Object.entries(values).some(([key, entry]) => entry.length > limits[key as keyof typeof limits])) {
		redirect("/admin/school-information?error=too-long");
	}

	const data = { schoolName, address: location, vision, mission, schoolHistory: history };
	await prisma.schoolSetting.upsert({ where: { id: "school" }, create: { id: "school", ...data }, update: data });

	for (const path of ["/", "/about", "/about/vision-mission", "/contact"]) revalidatePath(path);
	redirect("/admin/school-information?status=saved");
}