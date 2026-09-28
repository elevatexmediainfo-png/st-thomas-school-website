-- DropIndex
DROP INDEX "GalleryPhoto_albumId_sortOrder_idx";

-- AlterTable
ALTER TABLE "AdmissionSetting" ADD COLUMN     "headline" TEXT,
ADD COLUMN     "introduction" TEXT;

-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "studentName" TEXT;

-- AlterTable
ALTER TABLE "GalleryPhoto" ADD COLUMN     "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "imageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SchoolSetting" ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "websiteUrl" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "studentName" TEXT,
    "year" INTEGER,
    "achievementDate" TIMESTAMP(3),
    "description" TEXT,
    "imageUrl" TEXT,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Achievement_status_achievementDate_idx" ON "Achievement"("status", "achievementDate");

-- CreateIndex
CREATE INDEX "Achievement_category_status_idx" ON "Achievement"("category", "status");

-- CreateIndex
CREATE INDEX "Achievement_year_status_idx" ON "Achievement"("year", "status");

-- CreateIndex
CREATE INDEX "GalleryPhoto_albumId_status_sortOrder_idx" ON "GalleryPhoto"("albumId", "status", "sortOrder");
