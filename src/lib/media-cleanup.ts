import { prisma } from "@/lib/prisma";
import { getMediaStorage } from "@/lib/media-storage";

export async function removeReplacedMedia(previousKey: string | null, nextKey: string | null) {
	if (!previousKey || previousKey === nextKey) return;
	const storage = getMediaStorage();
	if (!storage) return;
	try {
		await storage.delete(previousKey);
	} catch {
		console.error("Media provider cleanup failed; the old object may require manual cleanup.");
	}
}

// A gallery photo can also be an album cover, so only delete media that no gallery record still references.
export async function removeUnreferencedGalleryMedia(key: string | null): Promise<"deleted" | "kept" | "failed" | "skipped"> {
	if (!key) return "skipped";
	const [photos, covers] = await Promise.all([
		prisma.galleryPhoto.count({ where: { imageKey: key } }),
		prisma.galleryAlbum.count({ where: { coverImageKey: key } }),
	]);
	if (photos + covers > 0) return "kept";
	const storage = getMediaStorage();
	if (!storage) return "skipped";
	try {
		await storage.delete(key);
		return "deleted";
	} catch {
		console.error("Media provider cleanup failed; the object may require manual cleanup.");
		return "failed";
	}
}
