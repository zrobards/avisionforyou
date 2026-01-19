-- CreateTable
CREATE TABLE "newsletters" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "imageUrl" TEXT,
    "authorId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "newsletters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "newsletters_slug_key" ON "newsletters"("slug");

-- CreateIndex
CREATE INDEX "newsletters_status_idx" ON "newsletters"("status");

-- CreateIndex
CREATE INDEX "newsletters_authorId_idx" ON "newsletters"("authorId");

-- CreateIndex
CREATE INDEX "newsletters_publishedAt_idx" ON "newsletters"("publishedAt");

-- AddForeignKey
ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
