-- CreateTable
CREATE TABLE "media_items" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tags" TEXT[],
    "usage" TEXT[],
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_items_type_idx" ON "media_items"("type");

-- CreateIndex
CREATE INDEX "media_items_tags_idx" ON "media_items"("tags");

-- CreateIndex
CREATE INDEX "media_items_uploadedById_idx" ON "media_items"("uploadedById");

-- CreateIndex
CREATE INDEX "media_items_uploadedAt_idx" ON "media_items"("uploadedAt");

-- AddForeignKey
ALTER TABLE "media_items" ADD CONSTRAINT "media_items_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
