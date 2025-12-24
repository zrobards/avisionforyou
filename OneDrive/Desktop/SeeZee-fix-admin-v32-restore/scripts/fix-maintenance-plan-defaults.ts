/**
 * Fix existing maintenance plans that have default values (4 hours, 3 requests)
 * by updating them to use tier-specific values
 */

import { PrismaClient } from '@prisma/client';
import { NONPROFIT_TIERS } from '../src/lib/config/tiers';

const prisma = new PrismaClient();

// Use centralized tier config
const TIER_CONFIG: Record<string, { hours: number; requests: number }> = {
  ESSENTIALS: { 
    hours: NONPROFIT_TIERS.ESSENTIALS.supportHoursIncluded, 
    requests: NONPROFIT_TIERS.ESSENTIALS.changeRequestsIncluded 
  },
  DIRECTOR: { 
    hours: NONPROFIT_TIERS.DIRECTOR.supportHoursIncluded, 
    requests: NONPROFIT_TIERS.DIRECTOR.changeRequestsIncluded 
  },
  COO: { 
    hours: NONPROFIT_TIERS.COO.supportHoursIncluded, 
    requests: NONPROFIT_TIERS.COO.changeRequestsIncluded 
  },
};

async function main() {
  console.log('Fixing maintenance plan defaults...\n');

  const plans = await prisma.maintenancePlan.findMany({
    where: {
      status: 'ACTIVE',
    },
  });

  console.log(`Found ${plans.length} active maintenance plans\n`);

  let updated = 0;
  let skipped = 0;

  for (const plan of plans) {
    const tierKey = (plan.tier || 'ESSENTIALS').toUpperCase();
    const tierConfig = TIER_CONFIG[tierKey] || TIER_CONFIG.ESSENTIALS;
    
    const schemaDefaultHours = 4;
    const schemaDefaultRequests = 3;
    
    // Check if plan has default values that should be updated to tier values
    const needsUpdate = 
      (plan.supportHoursIncluded === schemaDefaultHours && tierConfig.hours !== schemaDefaultHours) ||
      (plan.changeRequestsIncluded === schemaDefaultRequests && tierConfig.requests !== schemaDefaultRequests);
    
    if (needsUpdate) {
      await prisma.maintenancePlan.update({
        where: { id: plan.id },
        data: {
          supportHoursIncluded: tierConfig.hours,
          changeRequestsIncluded: tierConfig.requests,
        },
      });
      
      console.log(`✅ Updated plan ${plan.id} (${tierKey}): ${plan.supportHoursIncluded} → ${tierConfig.hours} hours, ${plan.changeRequestsIncluded} → ${tierConfig.requests} requests`);
      updated++;
    } else {
      console.log(`⏭️  Skipped plan ${plan.id} (${tierKey}): Already has correct values (${plan.supportHoursIncluded} hours, ${plan.changeRequestsIncluded} requests)`);
      skipped++;
    }
  }

  console.log(`\n✅ Done! Updated ${updated} plans, skipped ${skipped} plans`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

