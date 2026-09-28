export type NoticeRecord = {
  type: "NEWS" | "NOTICE";
  slug: string;
  title: string;
  date: string;
  category: string;
  description: string;
  content: string;
  pinned: boolean;
  published: boolean;
  archived: boolean;
  imageLabel: string;
  imageUrl: string | null;
  imageAlt: string | null;
  documentUrl: string | null;
};

export type EventRecord = {
  slug: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  description: string;
  featured: boolean;
  published: boolean;
  status: "upcoming" | "past";
  imageLabel: string;
  imageUrl: string | null;
  imageAlt: string | null;
  gallery: string[];
};

export const noticeCategories = ["All notices", "Admissions", "Academic", "Campus"];
export const eventCategories = ["All events", "Academic", "Campus life", "Activities"];
