export type DownloadRecord = {
  id: string;
  title: string;
  category: string;
  description: string;
  file: string;
  fileType: string;
  fileSize: string;
  publishDate: string;
  published: boolean;
};

export const downloadCategories = ["All documents", "Admission Forms", "Circulars", "Academic Calendar", "Fee Structure", "Forms", "Other Documents"];

