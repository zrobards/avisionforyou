-- CreateTable
CREATE TABLE "community_announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "community_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "community_announcements_published_idx" ON "community_announcements"("published");

-- CreateIndex
CREATE INDEX "community_announcements_createdAt_idx" ON "community_announcements"("createdAt");

-- CreateIndex
CREATE INDEX "community_resources_category_idx" ON "community_resources"("category");

-- CreateIndex
CREATE INDEX "community_resources_active_idx" ON "community_resources"("active");

-- CreateIndex
CREATE INDEX "community_resources_order_idx" ON "community_resources"("order");

-- AddForeignKey
ALTER TABLE "community_announcements" ADD CONSTRAINT "community_announcements_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
