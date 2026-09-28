import type { Metadata } from "next";
import { AdmissionsPage } from "@/components/admissions-pages";
import { SiteFooter } from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admissions | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Admissions information and enquiry form placeholders for St. Thomas English School, Ruabandha, Bhilai..",
};

export default async function AdmissionsRoute() {
  const settings = await prisma.admissionSetting.findUnique({ where: { id: "admissions" } });
  return <div id="top"><SiteHeader /><AdmissionsPage settings={settings} /><SiteFooter /></div>;
}