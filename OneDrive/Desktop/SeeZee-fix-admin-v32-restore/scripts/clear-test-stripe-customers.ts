/**
 * Clear test Stripe customer IDs and checkout session IDs from database
 * 
 * Test customers in Stripe start with 'cus_T' (test mode)
 * Test checkout sessions start with 'cs_test_' (test mode)
 * Live customers/sessions use different prefixes
 * 
 * This script clears test IDs so that new live customers/sessions
 * can be created when users attempt payments with live Stripe keys.
 * 
 * Usage:
 *   npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/clear-test-stripe-customers.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearTestStripeCustomers() {
  try {
    console.log('🔍 Finding test Stripe IDs...\n');

    // Count test customers before clearing
    const orgsBefore = await prisma.organization.count({
      where: {
        stripeCustomerId: {
          startsWith: 'cus_T',
        },
      },
    });

    const projectsBefore = await prisma.project.count({
      where: {
        stripeCustomerId: {
          startsWith: 'cus_T',
        },
      },
    });

    const checkoutSessionsBefore = await prisma.maintenancePlan.count({
      where: {
        stripeCheckoutSessionId: {
          startsWith: 'cs_test_',
        },
      },
    });

    console.log(`Found ${orgsBefore} organizations with test customer IDs`);
    console.log(`Found ${projectsBefore} projects with test customer IDs`);
    console.log(`Found ${checkoutSessionsBefore} maintenance plans with test checkout session IDs\n`);

    if (orgsBefore === 0 && projectsBefore === 0 && checkoutSessionsBefore === 0) {
      console.log('✅ No test Stripe IDs found. Nothing to clear!');
      return;
    }

    // Clear test customer IDs
    console.log('🧹 Clearing test Stripe IDs...\n');

    const orgsResult = await prisma.organization.updateMany({
      where: {
        stripeCustomerId: {
          startsWith: 'cus_T',
        },
      },
      data: {
        stripeCustomerId: null,
      },
    });

    const projectsResult = await prisma.project.updateMany({
      where: {
        stripeCustomerId: {
          startsWith: 'cus_T',
        },
      },
      data: {
        stripeCustomerId: null,
      },
    });

    const checkoutSessionsResult = await prisma.maintenancePlan.updateMany({
      where: {
        stripeCheckoutSessionId: {
          startsWith: 'cs_test_',
        },
      },
      data: {
        stripeCheckoutSessionId: null,
      },
    });

    console.log(`✅ Cleared ${orgsResult.count} organization customer IDs`);
    console.log(`✅ Cleared ${projectsResult.count} project customer IDs`);
    console.log(`✅ Cleared ${checkoutSessionsResult.count} checkout session IDs\n`);

    // Verify all cleared
    const orgsAfter = await prisma.organization.count({
      where: {
        stripeCustomerId: {
          startsWith: 'cus_T',
        },
      },
    });

    const projectsAfter = await prisma.project.count({
      where: {
        stripeCustomerId: {
          startsWith: 'cus_T',
        },
      },
    });

    const checkoutSessionsAfter = await prisma.maintenancePlan.count({
      where: {
        stripeCheckoutSessionId: {
          startsWith: 'cs_test_',
        },
      },
    });

    if (orgsAfter === 0 && projectsAfter === 0 && checkoutSessionsAfter === 0) {
      console.log('✅ All test Stripe IDs cleared successfully!');
      console.log('\n💡 Users will need to create new payment methods with live Stripe keys.');
    } else {
      console.warn(`⚠️  Warning: ${orgsAfter} organizations, ${projectsAfter} projects, and ${checkoutSessionsAfter} maintenance plans still have test IDs`);
    }
  } catch (error) {
    console.error('❌ Error clearing test customer IDs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
clearTestStripeCustomers()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

