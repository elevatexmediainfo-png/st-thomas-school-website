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
