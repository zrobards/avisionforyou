-- AddBoardAlumniCommunityRoles migration
-- This migration adds BOARD, ALUMNI, and COMMUNITY roles and removes STAFF role

-- Step 1: Add new enum values to UserRole
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'BOARD';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ALUMNI';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'COMMUNITY';

-- Step 2: Migrate any existing STAFF users to appropriate roles
-- This updates STAFF users to ADMIN (preserving their access level)
-- If you want different mapping logic, adjust this UPDATE statement
UPDATE "users" SET "role" = 'ADMIN' WHERE "role" = 'STAFF';

-- Note: The STAFF enum value cannot be removed directly in PostgreSQL
-- Once all users are migrated away from STAFF, it will become unused
-- If you need to remove it completely, you would need to recreate the enum
-- which requires dropping and recreating dependent columns

-- For now, STAFF remains in the enum but is deprecated and unused
