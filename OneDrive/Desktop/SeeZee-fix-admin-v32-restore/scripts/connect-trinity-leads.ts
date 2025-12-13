import { prisma } from '../src/lib/prisma';

async function connectLeadsToTrinity() {
  console.log('🔧 Connecting leads to 20260191@trinity.rocks...\n');

  // 1. Find or create user with trinity email
  let trinityUser = await prisma.user.findUnique({
    where: { email: '20260191@trinity.rocks' }
  });

  if (!trinityUser) {
    console.log('❌ User 20260191@trinity.rocks not found');
    console.log('ℹ️  This user needs to sign in first via Google OAuth');
    console.log('ℹ️  Or creating a basic user record...\n');
    
    trinityUser = await prisma.user.create({
      data: {
        email: '20260191@trinity.rocks',
        name: 'Trinity User',
        role: 'USER'
      }
    });
    console.log('✅ Created user:', trinityUser.email);
  } else {
    console.log('✅ Found user:', trinityUser.email);
  }

  // 2. Find SeeZee organization
  const seeZeeOrg = await prisma.organization.findFirst({
    where: { name: 'SeeZee' }
  });

  if (!seeZeeOrg) {
    console.log('❌ SeeZee organization not found');
    await prisma.$disconnect();
    return;
  }

  console.log('✅ Found organization:', seeZeeOrg.name);

  // 3. Add trinity user to SeeZee organization
  const existingMember = await prisma.organizationMember.findFirst({
    where: {
      userId: trinityUser.id,
      organizationId: seeZeeOrg.id
    }
  });

  if (!existingMember) {
    console.log('\n🔧 Adding 20260191@trinity.rocks to SeeZee organization...');
    await prisma.organizationMember.create({
      data: {
        userId: trinityUser.id,
        organizationId: seeZeeOrg.id,
        role: 'USER'
      }
    });
    console.log('✅ Added as USER member');
  } else {
    console.log('\n✅ Already a member with role:', existingMember.role);
  }

  // 4. Find all leads and update their email
  const allLeads = await prisma.lead.findMany({
    where: {
      organizationId: seeZeeOrg.id
    }
  });

  console.log(`\n📋 Found ${allLeads.length} leads in SeeZee organization`);

  // 5. Update leads to use trinity email
  if (allLeads.length > 0) {
    console.log('\n🔧 Updating lead emails to 20260191@trinity.rocks...');
    
    for (const lead of allLeads) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          email: '20260191@trinity.rocks'
        }
      });
      console.log(`  ✅ Updated lead: ${lead.name || lead.email}`);
    }
  }

  // 6. Find all projects and update their lead to trinity email
  const projects = await prisma.project.findMany({
    where: {
      organizationId: seeZeeOrg.id
    },
    include: {
      lead: true
    }
  });

  console.log(`\n📁 Found ${projects.length} projects in SeeZee organization`);

  if (projects.length > 0) {
    console.log('\n🔧 Ensuring projects are linked to trinity email lead...');
    
    // Find or create a lead for trinity email
    let trinityLead = await prisma.lead.findFirst({
      where: { 
        email: '20260191@trinity.rocks',
        organizationId: seeZeeOrg.id
      }
    });

    if (!trinityLead) {
      console.log('  🔧 Creating lead for 20260191@trinity.rocks...');
      trinityLead = await prisma.lead.create({
        data: {
          email: '20260191@trinity.rocks',
          name: trinityUser.name || 'Trinity User',
          status: 'QUALIFIED',
          source: 'Direct',
          organizationId: seeZeeOrg.id
        }
      });
      console.log('  ✅ Created lead');
    }

    for (const project of projects) {
      await prisma.project.update({
        where: { id: project.id },
        data: {
          leadId: trinityLead.id,
          clientEmail: '20260191@trinity.rocks'
        }
      });
      console.log(`  ✅ Updated project: ${project.name}`);
    }
  }

  console.log('\n🎉 All leads and projects connected to 20260191@trinity.rocks!');
  console.log('\n✅ User 20260191@trinity.rocks can now:');
  console.log('  - Access all SeeZee projects');
  console.log('  - View the client dashboard');
  console.log('  - See all project data and milestones');
}

connectLeadsToTrinity()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
