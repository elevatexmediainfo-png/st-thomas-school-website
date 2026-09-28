import type { Metadata } from "next";
import { VisionMissionPage } from "@/components/about-pages";

export const metadata: Metadata = {
  title: "Vision, Mission & Values | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Explore the editable vision, mission and core values of St. Thomas English School, Ruabandha, Bhilai..",
};

export default function VisionMissionRoute() {
  return <VisionMissionPage />;
}
