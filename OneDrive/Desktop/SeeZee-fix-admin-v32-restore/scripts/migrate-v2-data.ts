/**
 * SeeZee V2 Data Migration Script
 * Migrates existing data to match new V2 schema before db push
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting SeeZee V2 data migration...\n');

  // Step 1: Map old ProjectStatus values to new ones
  console.log('Step 1: Migrating ProjectStatus values...');
  
  const statusMappings = [
    { old: 'PLANNING', new: 'LEAD' },
    { old: 'DESIGN', new: 'ACTIVE' },
    { old: 'BUILD', new: 'ACTIVE' },
    { old: 'LAUNCH', new: 'REVIEW' },
    { old: 'ON_HOLD', new: 'ACTIVE' },
    { old: 'BRIEF_PENDING', new: 'LEAD' },
    { old: 'BRIEF_SUBMITTED', new: 'QUOTED' },
    { old: 'QUOTE_READY', new: 'QUOTED' },
    { old: 'PAID', new: 'DEPOSIT_PAID' },
    { old: 'IN_PROGRESS', new: 'ACTIVE' },
  ];

  for (const mapping of statusMappings) {
    const count = await prisma.$executeRawUnsafe(
      `UPDATE "projects" SET status = '${mapping.new}' WHERE status = '${mapping.old}'`
    );
    if (count > 0) {
      console.log(`  ✓ Migrated ${count} projects from ${mapping.old} → ${mapping.new}`);
    }
  }

  // Step 2: Handle Lead.serviceType conversion
  console.log('\nStep 2: Preparing Lead.serviceType for conversion...');
  
  // Map legacy string values to ServiceCategory enum
  const serviceTypeMappings = [
    { old: 'business-website', new: 'BUSINESS_WEBSITE' },
    { old: 'nonprofit-website', new: 'NONPROFIT_WEBSITE' },
    { old: 'personal-website', new: 'PERSONAL_WEBSITE' },
    { old: 'maintenance', new: 'MAINTENANCE_PLAN' },
    { old: 'maintenance-plan', new: 'MAINTENANCE_PLAN' },
    { old: 'ecommerce', new: 'BUSINESS_WEBSITE' }, // Map e-commerce to business
    { old: 'small-business', new: 'BUSINESS_WEBSITE' },
    { old: 'nonprofit', new: 'NONPROFIT_WEBSITE' },
    { old: 'personal', new: 'PERSONAL_WEBSITE' },
  ];

  // First, check what service types exist
  const existingTypes = await prisma.$queryRawUnsafe<Array<{ serviceType: string; count: number }>>(
    `SELECT "serviceType", COUNT(*) as count FROM "leads" WHERE "serviceType" IS NOT NULL GROUP BY "serviceType"`
  );
  
  console.log('  Current service types in database:');
  existingTypes.forEach(({ serviceType, count }) => {
    console.log(`    - ${serviceType}: ${count} leads`);
  });

  // Apply mappings
  for (const mapping of serviceTypeMappings) {
    const count = await prisma.$executeRawUnsafe(
      `UPDATE "leads" SET "serviceType" = '${mapping.new}' WHERE "serviceType" = '${mapping.old}'`
    );
    if (count > 0) {
      console.log(`  ✓ Mapped ${count} leads from "${mapping.old}" → ${mapping.new}`);
    }
  }

  // Set any remaining unmapped service types to BUSINESS_WEBSITE as default
  const unmappedCount = await prisma.$executeRawUnsafe(
    `UPDATE "leads" SET "serviceType" = 'BUSINESS_WEBSITE' 
     WHERE "serviceType" IS NOT NULL 
     AND "serviceType" NOT IN ('BUSINESS_WEBSITE', 'NONPROFIT_WEBSITE', 'PERSONAL_WEBSITE', 'MAINTENANCE_PLAN')`
  );
  
  if (unmappedCount > 0) {
    console.log(`  ✓ Set ${unmappedCount} unmapped leads to default: BUSINESS_WEBSITE`);
  }

  // Step 3: Add internalNotes column with empty string default
  console.log('\nStep 3: Preparing for new Lead.internalNotes column...');
  console.log('  (Column will be added automatically by db push)');

  console.log('\n✅ Migration completed successfully!');
  console.log('\nYou can now safely run: npx prisma db push');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
