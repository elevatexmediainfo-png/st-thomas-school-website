"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateSchoolSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/admin");
  const value = (name: string) => { const raw = formData.get(name); return typeof raw === "string" ? raw.trim() || null : null; };
  const json = (name: string) => { const current = value(name); return current ? { value: current } : undefined; };
  const email = value("email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/admin/settings?error=invalid-email");
  const mapLink = value("mapLink");
  if (mapLink) { try { new URL(mapLink); } catch { redirect("/admin/settings?error=invalid-map-url"); } }
  const socialLinks = value("socialLinks");
  if (socialLinks) { const invalid = socialLinks.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).some((line) => { try { new URL(line); return false; } catch { return line.toLowerCase() !== "coming soon"; } }); if (invalid) redirect("/admin/settings?error=invalid-social-url"); }
  const programNames = (value("academicPrograms") ?? "").split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
  const extraSettings = { ...(value("extraSettings") ? { value: value("extraSettings") } : {}), academicPrograms: programNames.map((name) => ({ name, description: "" })) };
  const shared = { schoolName: value("schoolName"), schoolHistory: value("schoolHistory"), vision: value("vision"), mission: value("mission"), motto: value("motto"), mottoSupportText: value("mottoSupportText"), aboutSchool: value("aboutSchool"), principalMessage: value("principalMessage"), chairmanDirectorMessage: value("chairmanDirectorMessage"), principalName: value("principalName"), principalDesignation: value("principalDesignation"), principalPhotoUrl: value("principalPhotoUrl"), principalDeskTitle: value("principalDeskTitle"), sportsMessage: value("sportsMessage"), sportsMessageAuthorName: value("sportsMessageAuthorName"), sportsMessageAuthorRole: value("sportsMessageAuthorRole"), footerText: value("footerText"), address: value("address"), phone: value("phone"), email, whatsappNumber: value("whatsappNumber"), mapLink, workingHours: json("workingHours"), socialLinks: json("socialLinks"), extraSettings };
  await prisma.schoolSetting.upsert({ where: { id: "school" }, create: { id: "school", ...shared }, update: shared });
  revalidatePath("/admin/settings"); revalidatePath("/contact"); revalidatePath("/about"); revalidatePath("/about/vision-mission"); revalidatePath("/about/principal-message"); revalidatePath("/administration/principal"); revalidatePath("/academics"); revalidatePath("/academics/sports"); redirect("/admin/settings?status=saved");
}
