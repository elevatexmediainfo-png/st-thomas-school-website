-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN     "imageAlt" TEXT,
ADD COLUMN     "imageKey" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "imageAlt" TEXT,
ADD COLUMN     "imageKey" TEXT;

-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "imageAlt" TEXT,
ADD COLUMN     "imageKey" TEXT;

-- AlterTable
ALTER TABLE "FacultyMember" ADD COLUMN     "photoAlt" TEXT,
ADD COLUMN     "photoKey" TEXT;

-- AlterTable
ALTER TABLE "GalleryAlbum" ADD COLUMN     "coverImageAlt" TEXT,
ADD COLUMN     "coverImageKey" TEXT;

-- AlterTable
ALTER TABLE "GalleryPhoto" ADD COLUMN     "altText" TEXT,
ADD COLUMN     "imageKey" TEXT;

-- AlterTable
ALTER TABLE "Notice" ADD COLUMN     "imageAlt" TEXT,
ADD COLUMN     "imageKey" TEXT;

-- AlterTable
ALTER TABLE "SchoolSetting" ADD COLUMN     "principalPhotoAlt" TEXT,
ADD COLUMN     "principalPhotoKey" TEXT;
