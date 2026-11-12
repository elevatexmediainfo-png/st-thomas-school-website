export type LeadershipProfile = {
  id: string; fullName: string; designation: string; photoUrl: string | null; photoAlt: string | null;
  message: string | null; summary: string | null; sortOrder: number;
  systemRole: "CHAIRMAN" | "MANAGER" | "PRINCIPAL" | null;
  createdAt: Date; updatedAt: Date; title?: string | null;
};
type PrincipalSource = {
  principalName: string | null; principalDesignation: string | null; principalMessage: string | null;
  principalPhotoUrl: string | null; principalPhotoAlt: string | null; principalSummary: string | null;
  principalStatus: string; principalSortOrder: number; principalProfileCreatedAt: Date;
  principalProfileUpdatedAt: Date; principalDeskTitle: string | null;
};

export function publishedLeadership(settings: PrincipalSource | null, members: (LeadershipProfile & { status: string })[]): LeadershipProfile[] {
  const profiles: LeadershipProfile[] = members
    .filter(member => member.status === "PUBLISHED" && member.fullName.trim() && member.designation.trim() && member.message?.trim())
    .map(member => ({ id: member.id, fullName: member.fullName, designation: member.designation,
      photoUrl: member.photoUrl, photoAlt: member.photoAlt, message: member.message, summary: member.summary,
      sortOrder: member.sortOrder, systemRole: member.systemRole, createdAt: member.createdAt, updatedAt: member.updatedAt }));
  if (settings?.principalStatus === "PUBLISHED" && settings.principalName?.trim() && settings.principalDesignation?.trim() && settings.principalMessage?.trim()) {
    profiles.push({ id: "principal", fullName: settings.principalName, designation: settings.principalDesignation,
      message: settings.principalMessage, summary: settings.principalSummary, photoUrl: settings.principalPhotoUrl,
      photoAlt: settings.principalPhotoAlt, sortOrder: settings.principalSortOrder, systemRole: "PRINCIPAL",
      createdAt: settings.principalProfileCreatedAt, updatedAt: settings.principalProfileUpdatedAt, title: settings.principalDeskTitle });
  }
  return profiles;
}
