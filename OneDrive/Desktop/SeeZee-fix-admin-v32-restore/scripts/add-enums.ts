/**
 * Add new enum values to database before migration
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding new enum values to database...\n');

  const sql = fs.readFileSync(
    path.join(__dirname, 'add-enum-values.sql'),
    'utf-8'
  );

  try {
    // Split by DO blocks and execute separately
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'QUOTED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProjectStatus')) THEN
              ALTER TYPE "ProjectStatus" ADD VALUE 'QUOTED';
          END IF;
      END $$;
    `);
    console.log('✓ Added QUOTED to ProjectStatus');

    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'LEAD' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProjectStatus')) THEN
              ALTER TYPE "ProjectStatus" ADD VALUE 'LEAD';
          END IF;
      END $$;
    `);
    console.log('✓ Added LEAD to ProjectStatus');

    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'DEPOSIT_PAID' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProjectStatus')) THEN
              ALTER TYPE "ProjectStatus" ADD VALUE 'DEPOSIT_PAID';
          END IF;
      END $$;
    `);
    console.log('✓ Added DEPOSIT_PAID to ProjectStatus');

    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'REVIEW' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProjectStatus')) THEN
              ALTER TYPE "ProjectStatus" ADD VALUE 'REVIEW';
          END IF;
      END $$;
    `);
    console.log('✓ Added REVIEW to ProjectStatus');

    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MAINTENANCE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ProjectStatus')) THEN
              ALTER TYPE "ProjectStatus" ADD VALUE 'MAINTENANCE';
          END IF;
      END $$;
    `);
    console.log('✓ Added MAINTENANCE to ProjectStatus');

    await prisma.$executeRawUnsafe(`
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
    `);
    console.log('✓ Created ServiceCategory enum');

    await prisma.$executeRawUnsafe(`
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
    `);
    console.log('✓ Created MaintenancePlanStatus enum');

    console.log('\n✅ All enum values added successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
