/**
 * Create MaintenancePlan table
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating MaintenancePlan table...\n');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "maintenance_plans" (
      "id" TEXT NOT NULL,
      "projectId" TEXT NOT NULL,
      "tier" TEXT NOT NULL,
      "monthlyPrice" DECIMAL(65,30) NOT NULL,
      "features" JSONB,
      "billingDay" INTEGER NOT NULL DEFAULT 1,
      "status" "MaintenancePlanStatus" NOT NULL DEFAULT 'ACTIVE',
      "stripeSubscriptionId" TEXT,
      "stripeCheckoutSessionId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      "cancelledAt" TIMESTAMP(3),
      
      CONSTRAINT "maintenance_plans_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "maintenance_plans_projectId_key" UNIQUE ("projectId"),
      CONSTRAINT "maintenance_plans_projectId_fkey" FOREIGN KEY ("projectId") 
        REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  console.log('✅ MaintenancePlan table created!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
