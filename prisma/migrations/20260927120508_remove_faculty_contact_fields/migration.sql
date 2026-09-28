/*
  Warnings:

  - You are about to drop the column `contactEmail` on the `FacultyMember` table. All the data in the column will be lost.
  - You are about to drop the column `contactPhone` on the `FacultyMember` table. All the data in the column will be lost.
  - You are about to drop the column `isContactPublic` on the `FacultyMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FacultyMember" DROP COLUMN "contactEmail",
DROP COLUMN "contactPhone",
DROP COLUMN "isContactPublic";
