-- CreateEnum for BoardDocumentType
CREATE TYPE "BoardDocumentType" AS ENUM ('FINANCIAL_REPORT', 'MEETING_MINUTES', 'BYLAWS', 'POLICY', 'CONTRACT', 'OTHER');

-- CreateEnum for BoardMeetingType
CREATE TYPE "BoardMeetingType" AS ENUM ('REGULAR', 'SPECIAL', 'EMERGENCY', 'COMMITTEE');

-- CreateTable: BoardDocument
CREATE TABLE "board_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "BoardDocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "isConfidential" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[],
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable: BoardMeeting
CREATE TABLE "board_meetings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "BoardMeetingType" NOT NULL DEFAULT 'REGULAR',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "agenda" TEXT,
    "minutesUrl" TEXT,
    "attendees" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "board_documents_type_idx" ON "board_documents"("type");
CREATE INDEX "board_documents_uploadedById_idx" ON "board_documents"("uploadedById");
CREATE INDEX "board_documents_uploadedAt_idx" ON "board_documents"("uploadedAt");

CREATE INDEX "board_meetings_scheduledDate_idx" ON "board_meetings"("scheduledDate");
CREATE INDEX "board_meetings_status_idx" ON "board_meetings"("status");
CREATE INDEX "board_meetings_createdById_idx" ON "board_meetings"("createdById");

-- AddForeignKey
ALTER TABLE "board_documents" ADD CONSTRAINT "board_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_meetings" ADD CONSTRAINT "board_meetings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
