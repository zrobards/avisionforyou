-- SeeZee V2: Add new enum values to existing enums before migration

-- Add new ProjectStatus values if they don't exist
DO $$ 
BEGIN
    -- Add QUOTED if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'QUOTED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProjectStatus')) THEN
        ALTER TYPE "ProjectStatus" ADD VALUE 'QUOTED';
    END IF;
END $$;

-- Now add LEAD if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'LEAD' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProjectStatus')) THEN
        ALTER TYPE "ProjectStatus" ADD VALUE 'LEAD';
    END IF;
END $$;

-- Add DEPOSIT_PAID if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'DEPOSIT_PAID' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProjectStatus')) THEN
        ALTER TYPE "ProjectStatus" ADD VALUE 'DEPOSIT_PAID';
    END IF;
END $$;

-- Add REVIEW if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'REVIEW' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProjectStatus')) THEN
        ALTER TYPE "ProjectStatus" ADD VALUE 'REVIEW';
    END IF;
END $$;

-- Add MAINTENANCE if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MAINTENANCE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProjectStatus')) THEN
        ALTER TYPE "ProjectStatus" ADD VALUE 'MAINTENANCE';
    END IF;
END $$;

-- Create ServiceCategory enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ServiceCategory') THEN
        CREATE TYPE "ServiceCategory" AS ENUM (
            'BUSINESS_WEBSITE',
            'NONPROFIT_WEBSITE',
            'PERSONAL_WEBSITE',
            'MAINTENANCE_PLAN'
        );
    END IF;
END $$;

-- Create MaintenancePlanStatus enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MaintenancePlanStatus') THEN
        CREATE TYPE "MaintenancePlanStatus" AS ENUM (
            'PENDING',
            'ACTIVE',
            'PAUSED',
            'CANCELLED'
        );
    END IF;
END $$;
