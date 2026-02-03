-- First, update any existing STAFF users to USER role
UPDATE "users" SET role = 'USER' WHERE role = 'STAFF';

-- Remove STAFF from UserRole enum
-- Note: PostgreSQL doesn't support directly removing enum values
-- We need to recreate the enum without STAFF
-- This is safe because we've already migrated all STAFF users to USER

-- Create new enum without STAFF
CREATE TYPE "UserRole_new" AS ENUM ('USER', 'ADMIN', 'BOARD', 'ALUMNI');

-- Update the column to use the new enum
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING "role"::text::"UserRole_new";

-- Drop the old enum
DROP TYPE "UserRole";

-- Rename the new enum to the original name
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
