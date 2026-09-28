-- CreateEnum
CREATE TYPE "CalendarCategory" AS ENUM ('SCHOOL_EVENT', 'HOLIDAY', 'EXAMINATION', 'PTM', 'ADMISSION', 'ACTIVITY', 'OTHER');

-- CreateEnum
CREATE TYPE "AcademicEntryType" AS ENUM ('SESSION', 'TERM', 'PTM', 'EXAMINATION', 'HOLIDAY');

-- CreateEnum
CREATE TYPE "FacultyCategory" AS ENUM ('TEACHING_FACULTY', 'ACADEMIC_COORDINATOR', 'ADMINISTRATIVE_STAFF', 'SUPPORT_STAFF');

-- CreateTable
CREATE TABLE "SchoolCalendarItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "eventTime" TEXT,
    "category" "CalendarCategory" NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "venue" TEXT,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolCalendarItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionSetting" (
    "id" TEXT NOT NULL DEFAULT 'admissions',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "availableClasses" JSONB,
    "eligibility" TEXT,
    "requiredDocuments" JSONB,
    "admissionProcess" JSONB,
    "importantInstructions" JSONB,
    "feeInformation" TEXT,
    "contactInformation" TEXT,
    "formTitle" TEXT,
    "formDescription" TEXT,
    "formUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "className" TEXT,
    "department" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicCalendarEntry" (
    "id" TEXT NOT NULL,
    "entryType" "AcademicEntryType" NOT NULL,
    "title" TEXT NOT NULL,
    "sessionName" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "classes" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicCalendarEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyllabusEntry" (
    "id" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "academicSession" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyllabusEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoCurricularActivity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "ageGroup" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoCurricularActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sport" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "ageGroup" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacultyMember" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "department" TEXT,
    "subject" TEXT,
    "category" "FacultyCategory" NOT NULL,
    "qualification" TEXT,
    "photoUrl" TEXT,
    "biography" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacultyMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SchoolCalendarItem_startDate_status_idx" ON "SchoolCalendarItem"("startDate", "status");

-- CreateIndex
CREATE INDEX "SchoolCalendarItem_category_status_idx" ON "SchoolCalendarItem"("category", "status");

-- CreateIndex
CREATE INDEX "SchoolCalendarItem_isImportant_status_idx" ON "SchoolCalendarItem"("isImportant", "status");

-- CreateIndex
CREATE INDEX "Subject_className_status_idx" ON "Subject"("className", "status");

-- CreateIndex
CREATE INDEX "Subject_department_status_idx" ON "Subject"("department", "status");

-- CreateIndex
CREATE INDEX "Subject_status_sortOrder_idx" ON "Subject"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "AcademicCalendarEntry_entryType_status_idx" ON "AcademicCalendarEntry"("entryType", "status");

-- CreateIndex
CREATE INDEX "AcademicCalendarEntry_sessionName_status_idx" ON "AcademicCalendarEntry"("sessionName", "status");

-- CreateIndex
CREATE INDEX "AcademicCalendarEntry_status_sortOrder_idx" ON "AcademicCalendarEntry"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "SyllabusEntry_className_subject_status_idx" ON "SyllabusEntry"("className", "subject", "status");

-- CreateIndex
CREATE INDEX "SyllabusEntry_academicSession_status_idx" ON "SyllabusEntry"("academicSession", "status");

-- CreateIndex
CREATE INDEX "CoCurricularActivity_category_status_idx" ON "CoCurricularActivity"("category", "status");

-- CreateIndex
CREATE INDEX "CoCurricularActivity_status_sortOrder_idx" ON "CoCurricularActivity"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "Sport_category_status_idx" ON "Sport"("category", "status");

-- CreateIndex
CREATE INDEX "Sport_status_sortOrder_idx" ON "Sport"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "FacultyMember_category_status_idx" ON "FacultyMember"("category", "status");

-- CreateIndex
CREATE INDEX "FacultyMember_status_sortOrder_idx" ON "FacultyMember"("status", "sortOrder");
