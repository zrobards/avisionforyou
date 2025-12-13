import { prisma } from '../src/lib/prisma';

async function setupAccount() {
  console.log('🔧 Setting up your SeeZee account...\n');

  // 1. Find your user account
  const user = await prisma.user.findFirst({
    where: { 
      OR: [
        { email: 'seanspm1007@gmail.com' },
        { email: 'sean.mcculloch23@gmail.com' }
      ]
    }
  });

  if (!user) {
    console.log('❌ User not found');
    console.log('ℹ️  Available users:');
    const allUsers = await prisma.user.findMany({
      select: { email: true, name: true }
    });
    console.log(allUsers);
    await prisma.$disconnect();
    return;
  }

  console.log('✅ Found user:', user.email, '(' + user.name + ')');

  // 2. Find or create SeeZee organization
  let seeZeeOrg = await prisma.organization.findFirst({
    where: { name: 'SeeZee' }
  });

  if (!seeZeeOrg) {
    console.log('\n🔧 Creating SeeZee organization...');
    seeZeeOrg = await prisma.organization.create({
      data: {
        name: 'SeeZee',
        email: 'hello@seezee.studio',
        address: '123 Main St, San Francisco, CA 94103',
      }
    });
    console.log('✅ Created organization:', seeZeeOrg.name);
  } else {
    console.log('\n✅ Found organization:', seeZeeOrg.name, '(ID:', seeZeeOrg.id + ')');
  }

  // 3. Add you as an ADMIN member of SeeZee
  const existingMember = await prisma.organizationMember.findFirst({
    where: {
      userId: user.id,
      organizationId: seeZeeOrg.id
    }
  });

  if (!existingMember) {
    console.log('\n🔧 Adding you as ADMIN to SeeZee organization...');
    await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: seeZeeOrg.id,
        role: 'ADMIN'
      }
    });
    console.log('✅ Added as ADMIN member');
  } else {
    console.log('\n✅ Already a member with role:', existingMember.role);
  }

  // 4. Find and link your projects to SeeZee organization
  const projects = await prisma.project.findMany({
    where: {
      lead: {
        email: user.email
      }
    },
    include: {
      lead: {
        select: { email: true, name: true }
      }
    }
  });

  console.log(`\n📁 Found ${projects.length} projects for your email`);

  if (projects.length > 0) {
    for (const project of projects) {
      console.log(`\n🔧 Processing project: ${project.name}`);
      
      // Update project to link to SeeZee organization
      if (project.organizationId !== seeZeeOrg.id) {
        await prisma.project.update({
          where: { id: project.id },
          data: {
            organizationId: seeZeeOrg.id
          }
        });
        console.log(`  ✅ Linked to SeeZee organization`);
      } else {
        console.log(`  ✅ Already linked to SeeZee`);
      }
    }
  }

  // 5. Update/create lead record for your account
  const existingLead = await prisma.lead.findFirst({
    where: { email: user.email }
  });

  if (!existingLead) {
    console.log('\n🔧 Creating lead record...');
    await prisma.lead.create({
      data: {
        email: user.email!,
        name: user.name || 'Sean',
        status: 'QUALIFIED',
        source: 'Direct',
        organizationId: seeZeeOrg.id
      }
    });
    console.log('✅ Created lead record');
  } else if (existingLead.organizationId !== seeZeeOrg.id) {
    console.log('\n🔧 Updating lead organization...');
    await prisma.lead.update({
      where: { id: existingLead.id },
      data: {
        organizationId: seeZeeOrg.id
      }
    });
    console.log('✅ Updated lead record');
  } else {
    console.log('\n✅ Lead already set up correctly');
  }

  // 6. Summary
  const finalProjects = await prisma.project.findMany({
    where: {
      OR: [
        { lead: { email: user.email } },
        { organizationId: seeZeeOrg.id }
      ]
    },
    select: {
      id: true,
      name: true,
      status: true
    }
  });

  console.log('\n🎉 Account setup complete!');
  console.log(`\n📊 You now have access to ${finalProjects.length} projects:`);
  finalProjects.forEach(p => {
    console.log(`  - ${p.name} (${p.status})`);
  });
  
  console.log('\n✅ Refresh your dashboard at /client to see your projects!');
}

setupAccount()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
