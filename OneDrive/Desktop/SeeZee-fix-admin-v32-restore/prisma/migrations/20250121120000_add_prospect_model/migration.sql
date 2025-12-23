-- CreateTable
CREATE TABLE "prospects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT,
    "company" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'GOOGLE_PLACES',
    "discoveryMetadata" JSONB,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ein" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "annualRevenue" INTEGER,
    "employeeCount" INTEGER,
    "websiteUrl" TEXT,
    "hasWebsite" BOOLEAN NOT NULL DEFAULT false,
    "websiteQuality" "WebsiteQuality",
    "needsAssessment" JSONB,
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "aiAnalysis" JSONB,
    "internalNotes" TEXT,
    "convertedToLeadId" TEXT,
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "prospects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prospects_leadScore_idx" ON "prospects"("leadScore");

-- CreateIndex
CREATE INDEX "prospects_city_state_idx" ON "prospects"("city", "state");

-- CreateIndex
CREATE INDEX "prospects_convertedAt_idx" ON "prospects"("convertedAt");

-- CreateIndex
CREATE INDEX "prospects_source_idx" ON "prospects"("source");

-- CreateIndex
CREATE UNIQUE INDEX "prospects_convertedToLeadId_key" ON "prospects"("convertedToLeadId");

-- AddForeignKey
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_convertedToLeadId_fkey" FOREIGN KEY ("convertedToLeadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

