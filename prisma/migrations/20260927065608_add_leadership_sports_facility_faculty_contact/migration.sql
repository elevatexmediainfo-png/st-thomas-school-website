-- AlterTable
ALTER TABLE "FacultyMember" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "isContactPublic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SchoolSetting" ADD COLUMN     "principalDesignation" TEXT,
ADD COLUMN     "principalDeskTitle" TEXT,
ADD COLUMN     "principalName" TEXT,
ADD COLUMN     "principalPhotoUrl" TEXT,
ADD COLUMN     "sportsMessage" TEXT,
ADD COLUMN     "sportsMessageAuthorName" TEXT,
ADD COLUMN     "sportsMessageAuthorRole" TEXT;

-- AlterTable
ALTER TABLE "SyllabusEntry" ADD COLUMN     "topics" JSONB;

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Facility_category_status_idx" ON "Facility"("category", "status");

-- CreateIndex
CREATE INDEX "Facility_status_sortOrder_idx" ON "Facility"("status", "sortOrder");
