import type { Metadata } from "next";
import { ContactPage } from "@/components/contact-page";
import { SiteFooter } from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Contact | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Contact St. Thomas English School, Ruabandha, Bhilai. in Ruabandha, Bhilai, Chhattisgarh.",
};

export default async function ContactRoute() {
  const settings = await prisma.schoolSetting.findUnique({ where: { id: "school" }, select: { schoolName: true, address: true, phone: true, email: true, mapLink: true, websiteUrl: true, instagramUrl: true, facebookUrl: true, youtubeUrl: true } });
  return <div id="top"><SiteHeader /><ContactPage settings={settings} /><SiteFooter /></div>;
}
