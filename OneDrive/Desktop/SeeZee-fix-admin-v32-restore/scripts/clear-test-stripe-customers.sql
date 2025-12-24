-- Clear test Stripe customer IDs and checkout session IDs from database
-- Test customers start with 'cus_T' (test mode)
-- Test checkout sessions start with 'cs_test_' (test mode)
-- Live customers/sessions use different prefixes

-- Clear from organizations table
UPDATE "organizations" 
SET "stripeCustomerId" = NULL 
WHERE "stripeCustomerId" LIKE 'cus_T%';

-- Clear from projects table
UPDATE "projects" 
SET "stripeCustomerId" = NULL 
WHERE "stripeCustomerId" LIKE 'cus_T%';

-- Clear checkout session IDs from maintenance plans
UPDATE "MaintenancePlan" 
SET "stripeCheckoutSessionId" = NULL 
WHERE "stripeCheckoutSessionId" LIKE 'cs_test_%';

-- Verify how many test IDs remain (should all be 0)
SELECT 
  'organizations' as table_name,
  COUNT(*) as test_ids_remaining
FROM "organizations"
WHERE "stripeCustomerId" LIKE 'cus_T%'
UNION ALL
SELECT 
  'projects' as table_name,
  COUNT(*) as test_ids_remaining
FROM "projects"
WHERE "stripeCustomerId" LIKE 'cus_T%'
UNION ALL
SELECT 
  'MaintenancePlan (checkout sessions)' as table_name,
  COUNT(*) as test_ids_remaining
FROM "MaintenancePlan"
WHERE "stripeCheckoutSessionId" LIKE 'cs_test_%';

