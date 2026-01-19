-- DropForeignKey
ALTER TABLE "newsletters" DROP CONSTRAINT "newsletters_authorId_fkey";

-- AlterTable
ALTER TABLE "donations" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "nextRenewalDate" TIMESTAMP(3),
ADD COLUMN     "recurringStartDate" TIMESTAMP(3),
ADD COLUMN     "renewalSchedule" TEXT NOT NULL DEFAULT 'anniversary',
ADD COLUMN     "squareSubscriptionId" TEXT;

-- CreateTable
CREATE TABLE "webhook_logs" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "donationId" TEXT,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processed',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "webhook_logs_provider_idx" ON "webhook_logs"("provider");

-- CreateIndex
CREATE INDEX "webhook_logs_eventType_idx" ON "webhook_logs"("eventType");

-- CreateIndex
CREATE INDEX "webhook_logs_donationId_idx" ON "webhook_logs"("donationId");

-- CreateIndex
CREATE INDEX "webhook_logs_eventId_idx" ON "webhook_logs"("eventId");

-- CreateIndex
CREATE INDEX "webhook_logs_status_idx" ON "webhook_logs"("status");

-- CreateIndex
CREATE INDEX "webhook_logs_createdAt_idx" ON "webhook_logs"("createdAt");

-- CreateIndex
CREATE INDEX "donations_frequency_idx" ON "donations"("frequency");

-- CreateIndex
CREATE INDEX "donations_squareSubscriptionId_idx" ON "donations"("squareSubscriptionId");

-- CreateIndex
CREATE INDEX "donations_nextRenewalDate_idx" ON "donations"("nextRenewalDate");

-- RenameForeignKey
ALTER TABLE "newsletters" RENAME CONSTRAINT "newsletters_authorid_fkey" TO "newsletters_authorId_fkey";
