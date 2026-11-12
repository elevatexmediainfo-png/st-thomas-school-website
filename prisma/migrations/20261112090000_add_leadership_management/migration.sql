-- Additive only: existing Principal and Chairman content is retained.
CREATE TYPE "LeadershipRole" AS ENUM ('CHAIRMAN', 'MANAGER');
CREATE TABLE "LeadershipMember" (
  "id" TEXT NOT NULL,
  "systemRole" "LeadershipRole",
  "fullName" TEXT NOT NULL,
  "designation" TEXT NOT NULL,
  "photoUrl" TEXT,
  "photoKey" TEXT,
  "photoAlt" TEXT,
  "message" TEXT,
  "summary" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LeadershipMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LeadershipMember_systemRole_key" ON "LeadershipMember"("systemRole");
CREATE INDEX "LeadershipMember_status_sortOrder_idx" ON "LeadershipMember"("status", "sortOrder");
ALTER TABLE "SchoolSetting"
  ADD COLUMN "principalSummary" TEXT,
  ADD COLUMN "principalSortOrder" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN "principalStatus" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
  ADD COLUMN "principalProfileCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "principalProfileUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
