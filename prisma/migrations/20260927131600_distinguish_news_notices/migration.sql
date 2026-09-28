-- CreateEnum
CREATE TYPE "NoticeType" AS ENUM ('NEWS', 'NOTICE');

-- AlterTable
ALTER TABLE "Notice" ADD COLUMN     "type" "NoticeType" NOT NULL DEFAULT 'NOTICE';

-- CreateIndex
CREATE INDEX "Notice_type_status_publishDate_idx" ON "Notice"("type", "status", "publishDate");
