import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { publishedLeadership, type LeadershipProfile } from "@/lib/leadership-profiles";
import { sortLeadership } from "@/lib/leadership-validation";
export type { LeadershipProfile } from "@/lib/leadership-profiles";

// Request-scoped memoization only. Never use fallback content for hidden profiles.
export const getPublishedLeadership = cache(async (): Promise<LeadershipProfile[]> => {
  const [settings, members] = await Promise.all([
    prisma.schoolSetting.findUnique({ where: { id: "school" } }),
    prisma.leadershipMember.findMany({ where: { status: "PUBLISHED" } }),
  ]);
  return sortLeadership(publishedLeadership(settings, members));
});
