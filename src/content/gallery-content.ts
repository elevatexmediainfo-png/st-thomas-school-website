export type GalleryAlbum = {
	id: string;
	slug: string;
	title: string;
	category: string;
	description: string;
	date: string;
	coverImage: string;
	coverImageUrl: string | null;
	coverImageAlt: string | null;
	photos: string[];
	captions: string[];
	photoAlts: string[];
	published: boolean;
};

export const galleryCategories = ["Campus", "Academics", "Sports", "Cultural Events", "Celebrations", "Activities"];
