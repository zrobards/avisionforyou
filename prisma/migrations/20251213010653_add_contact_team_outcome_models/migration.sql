-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESPONDED', 'RESOLVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('BOARD_PRESIDENT', 'BOARD_VP', 'BOARD_TREASURER', 'BOARD_SECRETARY', 'BOARD_MEMBER', 'EXECUTIVE_DIRECTOR', 'STAFF');

-- CreateTable
CREATE TABLE "contact_inquiries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "department" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'NEW',
    "assignedTo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'STAFF',
    "bio" TEXT NOT NULL,
    "credentials" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedin" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_outcomes" (
    "id" TEXT NOT NULL,
    "programName" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'percent',
    "period" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_inquiries_status_idx" ON "contact_inquiries"("status");

-- CreateIndex
CREATE INDEX "contact_inquiries_department_idx" ON "contact_inquiries"("department");

-- CreateIndex
CREATE INDEX "contact_inquiries_createdAt_idx" ON "contact_inquiries"("createdAt");

-- CreateIndex
CREATE INDEX "team_members_role_idx" ON "team_members"("role");

-- CreateIndex
CREATE INDEX "team_members_order_idx" ON "team_members"("order");

-- CreateIndex
CREATE INDEX "team_members_isActive_idx" ON "team_members"("isActive");

-- CreateIndex
CREATE INDEX "program_outcomes_programName_idx" ON "program_outcomes"("programName");

-- CreateIndex
CREATE INDEX "program_outcomes_metric_idx" ON "program_outcomes"("metric");

-- CreateIndex
CREATE INDEX "program_outcomes_isPublic_idx" ON "program_outcomes"("isPublic");
