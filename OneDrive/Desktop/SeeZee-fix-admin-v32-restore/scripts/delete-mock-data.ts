/**
 * Script to delete all mock/seeded data from the database
 * Run with: npx tsx scripts/delete-mock-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// IDs of mock invoices from seed data
const MOCK_INVOICE_IDS = [
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
  'cmhxkoqcz000akhy502gzks1s',
];

// Mock user emails from seed data
const MOCK_USER_EMAILS = [
  'john@acmecorp.com',
  'jane@techstart.io',
  'bob@innovate.com',
  'alice@digital.com',
  'charlie@nextgen.com',
  'diana@cloudtech.com',
  'edward@smartbiz.com',
  'fiona@webpro.com',
];

async function deleteMockData() {
  console.log('🗑️  Starting mock data deletion...\n');

  try {
    // 1. Delete payments for mock invoices
    console.log('1️⃣  Deleting payments...');
    const paymentsDeleted = await prisma.payment.deleteMany({
      where: { invoiceId: { in: MOCK_INVOICE_IDS } },
    });
    console.log(`   ✅ Deleted ${paymentsDeleted.count} payments\n`);

    // 2. Delete mock invoices
    console.log('2️⃣  Deleting invoices...');
    const invoicesDeleted = await prisma.invoice.deleteMany({
      where: { id: { in: MOCK_INVOICE_IDS } },
    });
    console.log(`   ✅ Deleted ${invoicesDeleted.count} invoices\n`);

    // 3. Find mock projects (by pattern matching)
    console.log('3️⃣  Finding mock projects...');
    const mockProjects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: 'Mock' } },
          { name: { contains: 'Sample' } },
          { name: { contains: 'Test' } },
          { name: { contains: 'Acme' } },
          { name: { contains: 'TechStart' } },
          { name: { contains: 'Innovate' } },
        ],
      },
      select: { id: true, name: true },
    });
    const mockProjectIds = mockProjects.map((p) => p.id);
    console.log(`   Found ${mockProjects.length} mock projects:`);
    mockProjects.forEach((p) => console.log(`   - ${p.name}`));
    console.log();

    if (mockProjectIds.length > 0) {
      // 4. Delete client tasks for mock projects
      console.log('4️⃣  Deleting client tasks...');
      const tasksDeleted = await prisma.clientTask.deleteMany({
        where: { projectId: { in: mockProjectIds } },
      });
      console.log(`   ✅ Deleted ${tasksDeleted.count} client tasks\n`);

      // 5. Delete files for mock projects
      console.log('5️⃣  Deleting files...');
      const filesDeleted = await prisma.file.deleteMany({
        where: { projectId: { in: mockProjectIds } },
      });
      console.log(`   ✅ Deleted ${filesDeleted.count} files\n`);

      // 6. Delete milestones for mock projects
      console.log('6️⃣  Deleting milestones...');
      const milestonesDeleted = await prisma.projectMilestone.deleteMany({
        where: { projectId: { in: mockProjectIds } },
      });
      console.log(`   ✅ Deleted ${milestonesDeleted.count} milestones\n`);

      // 7. Delete todos for mock projects
      console.log('7️⃣  Deleting todos...');
      const todosDeleted = await prisma.todo.deleteMany({
        where: { projectId: { in: mockProjectIds } },
      });
      console.log(`   ✅ Deleted ${todosDeleted.count} todos\n`);

      // 8. Delete activities for mock projects
      console.log('8️⃣  Deleting activities...');
      const activitiesDeleted = await prisma.activity.deleteMany({
        where: { projectId: { in: mockProjectIds } },
      });
      console.log(`   ✅ Deleted ${activitiesDeleted.count} activities\n`);

      // 9. Delete notifications for mock projects
      console.log('9️⃣  Deleting notifications...');
      const notificationsDeleted = await prisma.notification.deleteMany({
        where: { projectId: { in: mockProjectIds } },
      });
      console.log(`   ✅ Deleted ${notificationsDeleted.count} notifications\n`);

      // 10. Delete mock projects
      console.log('🔟 Deleting projects...');
      const projectsDeleted = await prisma.project.deleteMany({
        where: { id: { in: mockProjectIds } },
      });
      console.log(`   ✅ Deleted ${projectsDeleted.count} projects\n`);
    }

    // 11. Delete mock leads
    console.log('1️⃣1️⃣  Deleting mock leads...');
    const leadsDeleted = await prisma.lead.deleteMany({
      where: {
        OR: [
          { email: { contains: 'example.com' } },
          { email: { contains: 'test.com' } },
          { company: { contains: 'Test' } },
          { company: { contains: 'Sample' } },
        ],
      },
    });
    console.log(`   ✅ Deleted ${leadsDeleted.count} leads\n`);

    // 12. Delete mock users (carefully!)
    console.log('1️⃣2️⃣  Deleting mock users...');
    const usersDeleted = await prisma.user.deleteMany({
      where: { email: { in: MOCK_USER_EMAILS } },
    });
    console.log(`   ✅ Deleted ${usersDeleted.count} users\n`);

    // 13. Show remaining counts
    console.log('\n📊 Database Summary:');
    const [users, projects, invoices, payments, leads] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.invoice.count(),
      prisma.payment.count(),
      prisma.lead.count(),
    ]);
    console.log(`   Users: ${users}`);
    console.log(`   Projects: ${projects}`);
    console.log(`   Invoices: ${invoices}`);
    console.log(`   Payments: ${payments}`);
    console.log(`   Leads: ${leads}`);

    console.log('\n✅ Mock data deletion complete!');
  } catch (error) {
    console.error('❌ Error deleting mock data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
deleteMockData()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
