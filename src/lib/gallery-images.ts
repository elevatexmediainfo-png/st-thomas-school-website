import { revalidatePath } from "next/cache";

export const galleryImageSelect = { id: true, imageUrl: true, imageKey: true, altText: true, caption: true, sortOrder: true, status: true } as const;

export type GalleryImageDto = {
  id: string;
  imageUrl: string | null;
  imageKey: string | null;
  altText: string | null;
  caption: string | null;
  sortOrder: number;
  status: string;
};

export const galleryTextLimit = 240;
export const galleryStatuses = ["PUBLISHED", "DRAFT", "UNPUBLISHED"] as const;

export function revalidateGallery(albumId: string) {
  revalidatePath("/admin/gallery");
  revalidatePath(`/admin/gallery/${albumId}`);
  revalidatePath("/gallery");
}
