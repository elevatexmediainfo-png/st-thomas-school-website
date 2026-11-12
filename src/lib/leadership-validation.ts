export const leadershipStatuses = ["DRAFT", "PUBLISHED", "UNPUBLISHED"] as const;
export type LeadershipStatus = typeof leadershipStatuses[number];

export function validateLeadership(input: {
  fullName: string; designation: string; message: string; summary: string;
  status: string; sortOrder: string; photoAlt: string;
}) {
  if (!input.fullName || !input.designation) return "Name and designation are required.";
  if (input.fullName.length > 160 || input.designation.length > 160 || input.message.length > 12000 || input.summary.length > 600 || input.photoAlt.length > 240) return "One or more fields exceed their length limit.";
  if (!leadershipStatuses.includes(input.status as LeadershipStatus)) return "Choose a valid publishing status.";
  if (input.status === "PUBLISHED" && !input.message.trim()) return "A full message is required before publishing.";
  if (!/^\d+$/.test(input.sortOrder) || !Number.isSafeInteger(Number(input.sortOrder)) || Number(input.sortOrder) > 1000000) return "Display order must be a whole number from 0 to 1000000.";
  return null;
}

export function sortLeadership<T extends { id: string; sortOrder: number }>(members: T[]) {
  return [...members].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
}
