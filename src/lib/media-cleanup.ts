import { prisma } from "@/lib/prisma";
import { getMediaStorage } from "@/lib/media-storage";

export async function removeReplacedMedia(previousKey: string | null, nextKey: string | null) {
	if (!previousKey || previousKey === nextKey) return;
	const storage = getMediaStorage();
	if (!storage) return;
	try {
		if (await isMediaReferenced(previousKey)) return;
		await storage.delete(previousKey);
	} catch {
		console.error("Media provider cleanup failed; the old object may require manual cleanup.");
	}
}

// Keys can be shared across modules; never delete a photograph still in use.
export async function isMediaReferenced(key: string) {
  // Also protect legacy/manual URL-only references to this managed public ID.
  const publicId = key.replace(/\.[^.]+$/, "");
  const ref = (keyField: string, urlField: string) => ({ OR: [{ [keyField]: key }, { [urlField]: { contains: `/${publicId}.` } }] });
  const counts = await Promise.all([
    prisma.leadershipMember.count({ where: ref("photoKey", "photoUrl") }),
    prisma.facultyMember.count({ where: ref("photoKey", "photoUrl") }),
    prisma.facility.count({ where: ref("imageKey", "imageUrl") }),
    prisma.notice.count({ where: ref("imageKey", "imageUrl") }),
    prisma.event.count({ where: ref("imageKey", "imageUrl") }),
    prisma.achievement.count({ where: ref("imageKey", "imageUrl") }),
    prisma.galleryPhoto.count({ where: ref("imageKey", "imageUrl") }),
    prisma.galleryAlbum.count({ where: ref("coverImageKey", "coverImage") }),
    prisma.coCurricularActivity.count({ where: { imageUrl: { contains: `/${publicId}.` } } }),
    prisma.sport.count({ where: { imageUrl: { contains: `/${publicId}.` } } }),
    prisma.schoolSetting.count({ where: { OR: [
      { principalPhotoKey: key }, { heroImageKey: key }, { introImageKey: key },
      { galleryImageOneKey: key }, { galleryImageTwoKey: key }, { galleryImageThreeKey: key },
      { galleryImageFourKey: key }, { galleryImageFiveKey: key },
      { principalPhotoUrl: { contains: `/${publicId}.` } }, { heroImageUrl: { contains: `/${publicId}.` } },
      { introImageUrl: { contains: `/${publicId}.` } }, { galleryImageOneUrl: { contains: `/${publicId}.` } },
      { galleryImageTwoUrl: { contains: `/${publicId}.` } }, { galleryImageThreeUrl: { contains: `/${publicId}.` } },
      { galleryImageFourUrl: { contains: `/${publicId}.` } }, { galleryImageFiveUrl: { contains: `/${publicId}.` } },
    ] } }),
  ]);
  return counts.some(count => count > 0);
}

// A gallery photo can also be an album cover, so only delete media that no gallery record still references.
export async function removeUnreferencedGalleryMedia(key: string | null): Promise<"deleted" | "kept" | "failed" | "skipped"> {
	if (!key) return "skipped";
	const [photos, covers] = await Promise.all([
		prisma.galleryPhoto.count({ where: { imageKey: key } }),
		prisma.galleryAlbum.count({ where: { coverImageKey: key } }),
	]);
	if (photos + covers > 0 || await isMediaReferenced(key)) return "kept";
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
