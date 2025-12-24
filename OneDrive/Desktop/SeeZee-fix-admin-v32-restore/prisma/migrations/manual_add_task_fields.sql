-- Manual migration to add change request and assignment fields to todos table
-- Run this manually if the automatic migration fails

-- Add changeRequestId column (nullable, unique)
ALTER TABLE "todos" 
ADD COLUMN IF NOT EXISTS "changeRequestId" TEXT;

-- Add assignedToRole column (nullable)
ALTER TABLE "todos" 
ADD COLUMN IF NOT EXISTS "assignedToRole" "UserRole";

-- Add assignedToTeamId column (nullable)
ALTER TABLE "todos" 
ADD COLUMN IF NOT EXISTS "assignedToTeamId" TEXT;

-- Add unique constraint on changeRequestId
CREATE UNIQUE INDEX IF NOT EXISTS "todos_changeRequestId_key" ON "todos"("changeRequestId") WHERE "changeRequestId" IS NOT NULL;

-- Add foreign key constraint for changeRequestId
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'todos_changeRequestId_fkey'
  ) THEN
    ALTER TABLE "todos" 
    ADD CONSTRAINT "todos_changeRequestId_fkey" 
    FOREIGN KEY ("changeRequestId") 
    REFERENCES "change_requests"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "todos_assignedToRole_idx" ON "todos"("assignedToRole");
CREATE INDEX IF NOT EXISTS "todos_assignedToTeamId_idx" ON "todos"("assignedToTeamId");
CREATE INDEX IF NOT EXISTS "todos_changeRequestId_idx" ON "todos"("changeRequestId");

-- Add relation to ChangeRequest model (this is handled by Prisma, but documenting here)
-- The ChangeRequest model should have: task Todo? @relation(fields: [id], references: [changeRequestId])




