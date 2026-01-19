-- CreateEnum
CREATE TYPE "BoardDocumentCategory" AS ENUM ('EXECUTIVE_DIRECTIVE', 'BOARD_UPDATE', 'FINANCIAL_SUMMARY', 'GOVERNANCE');

-- CreateTable
CREATE TABLE "board_updates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "BoardDocumentCategory" NOT NULL,
    "priority" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "board_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "category" "BoardDocumentCategory" NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,

    CONSTRAINT "board_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "board_updates_category_idx" ON "board_updates"("category");

-- CreateIndex
CREATE INDEX "board_updates_priority_idx" ON "board_updates"("priority");

-- CreateIndex
CREATE INDEX "board_updates_createdAt_idx" ON "board_updates"("createdAt");

-- CreateIndex
CREATE INDEX "board_documents_category_idx" ON "board_documents"("category");

-- CreateIndex
CREATE INDEX "board_documents_uploadedAt_idx" ON "board_documents"("uploadedAt");

-- AddForeignKey
ALTER TABLE "board_updates" ADD CONSTRAINT "board_updates_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_documents" ADD CONSTRAINT "board_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
