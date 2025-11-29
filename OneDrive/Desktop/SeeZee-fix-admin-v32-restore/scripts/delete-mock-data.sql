-- Delete Mock Data Script
-- Run this in your database to remove all seeded/mock data
-- Execute in order to respect foreign key constraints

-- 1. Delete payments first (they reference invoices)
DELETE FROM "payments"
WHERE "invoiceId" IN (
  'cmhmo80s8000c686qhjqv289r',
  'cmhtuws5p0001jg8uac0heubv',
  'cmhtyi8an002ygbqt7otsnmsg',
  'cmhtyi8kt0032gbqte8ib8dcc',
  'cmhtyi8ys0036gbqt3wuqdwhc',
  'cmhtyi95g003agbqtzepxy3yq',
  'cmhtyi9bs003egbqt3y80eohl',
  'cmhtyi9i7003igbqt1jsdmpys',
  'cmhtyi9oe003mgbqtpl0nkvuz',
  'cmhtyi9x6003sgbqtpxywqlnn',
  'cmhtyia3d003wgbqtnsc0pglg',
  'cmhtyia9o0040gbqtcvi59khw',
  'cmhtyiah40046gbqt7u18xnpg',
  'cmhtyiaog004agbqt9uiuwao5',
  'cmhtyiaut004egbqt3ijiwc44',
  'cmhtyib0y004igbqttp4oz536',
  'cmhtyib87004ogbqtiz5lkk3k',
  'cmhtyibee004sgbqtxrd63zld',
  'cmhtyibkk004wgbqtko2y6hpl',
  'cmhtyibrs0052gbqtambuuwm5',
  'cmhtyiby40056gbqtj3rms4wj',
  'cmhtyic4h005agbqtert8b5n9',
  'cmhtykc47000gjg8udiw5n7r8',
  'cmhtykk2m000ljg8ufz9rwppc',
  'cmhtykomk000qjg8u2qaa2ylf',
  'cmhvjdp7f0001qaugg5dpesx9',
  'cmhvjhho30006qaugl6j0xe1h',
  'cmhvjsjkk0008ewc8jvuefqfl',
  'cmhxko77l0005khy5kvg72g5k',
  'cmhxkoqcz000akhy502gzks1s'
);

-- 2. Delete invoices
DELETE FROM "invoices"
WHERE "id" IN (
  'cmhmo80s8000c686qhjqv289r',
  'cmhtuws5p0001jg8uac0heubv',
  'cmhtyi8an002ygbqt7otsnmsg',
  'cmhtyi8kt0032gbqte8ib8dcc',
  'cmhtyi8ys0036gbqt3wuqdwhc',
  'cmhtyi95g003agbqtzepxy3yq',
  'cmhtyi9bs003egbqt3y80eohl',
  'cmhtyi9i7003igbqt1jsdmpys',
  'cmhtyi9oe003mgbqtpl0nkvuz',
  'cmhtyi9x6003sgbqtpxywqlnn',
  'cmhtyia3d003wgbqtnsc0pglg',
  'cmhtyia9o0040gbqtcvi59khw',
  'cmhtyiah40046gbqt7u18xnpg',
  'cmhtyiaog004agbqt9uiuwao5',
  'cmhtyiaut004egbqt3ijiwc44',
  'cmhtyib0y004igbqttp4oz536',
  'cmhtyib87004ogbqtiz5lkk3k',
  'cmhtyibee004sgbqtxrd63zld',
  'cmhtyibkk004wgbqtko2y6hpl',
  'cmhtyibrs0052gbqtambuuwm5',
  'cmhtyiby40056gbqtj3rms4wj',
  'cmhtyic4h005agbqtert8b5n9',
  'cmhtykc47000gjg8udiw5n7r8',
  'cmhtykk2m000ljg8ufz9rwppc',
  'cmhtykomk000qjg8u2qaa2ylf',
  'cmhvjdp7f0001qaugg5dpesx9',
  'cmhvjhho30006qaugl6j0xe1h',
  'cmhvjsjkk0008ewc8jvuefqfl',
  'cmhxko77l0005khy5kvg72g5k',
  'cmhxkoqcz000akhy502gzks1s'
);

-- 3. Delete other related mock data (add more as needed)

-- Delete mock client tasks
DELETE FROM "client_tasks"
WHERE "projectId" IN (
  SELECT "id" FROM "projects" 
  WHERE "name" LIKE '%Mock%' 
  OR "name" LIKE '%Sample%'
  OR "name" LIKE '%Test%'
);

-- Delete mock files
DELETE FROM "files"
WHERE "projectId" IN (
  SELECT "id" FROM "projects" 
  WHERE "name" LIKE '%Mock%' 
  OR "name" LIKE '%Sample%'
  OR "name" LIKE '%Test%'
);

-- Delete mock milestones
DELETE FROM "project_milestones"
WHERE "projectId" IN (
  SELECT "id" FROM "projects" 
  WHERE "name" LIKE '%Mock%' 
  OR "name" LIKE '%Sample%'
  OR "name" LIKE '%Test%'
);

-- Delete mock todos
DELETE FROM "todos"
WHERE "projectId" IN (
  SELECT "id" FROM "projects" 
  WHERE "name" LIKE '%Mock%' 
  OR "name" LIKE '%Sample%'
  OR "name" LIKE '%Test%'
);

-- Delete mock activities
DELETE FROM "activities"
WHERE "projectId" IN (
  SELECT "id" FROM "projects" 
  WHERE "name" LIKE '%Mock%' 
  OR "name" LIKE '%Sample%'
  OR "name" LIKE '%Test%'
);

-- Delete mock notifications
DELETE FROM "notifications"
WHERE "projectId" IN (
  SELECT "id" FROM "projects" 
  WHERE "name" LIKE '%Mock%' 
  OR "name" LIKE '%Sample%'
  OR "name" LIKE '%Test%'
);

-- Delete mock projects
DELETE FROM "projects"
WHERE "name" LIKE '%Mock%' 
OR "name" LIKE '%Sample%'
OR "name" LIKE '%Test%';

-- Delete mock leads
DELETE FROM "leads"
WHERE "email" LIKE '%example.com%'
OR "email" LIKE '%test.com%'
OR "company" LIKE '%Test%'
OR "company" LIKE '%Sample%';

-- Delete mock organizations
DELETE FROM "organizations"
WHERE "name" LIKE '%Test%'
OR "name" LIKE '%Sample%'
OR "name" LIKE '%Mock%';

-- Delete mock users (CAREFUL - only delete test users, keep your real ones!)
DELETE FROM "users"
WHERE "email" IN (
  'john@acmecorp.com',
  'jane@techstart.io',
  'bob@innovate.com',
  'alice@digital.com',
  'charlie@nextgen.com',
  'diana@cloudtech.com',
  'edward@smartbiz.com',
  'fiona@webpro.com'
);

-- Verify deletion
SELECT COUNT(*) as remaining_invoices FROM "invoices";
SELECT COUNT(*) as remaining_payments FROM "payments";
SELECT COUNT(*) as remaining_projects FROM "projects";
SELECT COUNT(*) as remaining_users FROM "users";
