import { prisma } from '../src/lib/prisma';

async function linkUserToOrganization() {
  try {
    // Get your user
    const user = await prisma.user.findFirst({
      where: { email: 'sean@seezee.studio' }
    });
    
    if (!user) {
      console.log('User not found!');
      return;
    }
    
    console.log(`Found user: ${user.name} (${user.email})`);
    
    // Find the SeeZee organization with the projects
    const org = await prisma.organization.findUnique({
      where: { id: 'cmijlxjfb000011ukl0s2q03b' }
    });
    
    if (!org) {
      console.log('Organization not found!');
      return;
    }
    
    console.log(`Found organization: ${org.name}`);
    
    // Check if membership already exists
    const existing = await prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: org.id
      }
    });
    
    if (existing) {
      console.log('Membership already exists!');
      console.log(JSON.stringify(existing, null, 2));
      return;
    }
    
    // Create organization membership
    const membership = await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        role: 'ADMIN'
      }
    });
    
    console.log('\n✅ Successfully added user to organization!');
    console.log(JSON.stringify(membership, null, 2));
    
    // Verify projects are now accessible
    const projects = await prisma.project.findMany({
      where: {
        organizationId: org.id
      },
      select: {
        id: true,
        name: true,
        status: true
      }
    });
    
    console.log(`\n✅ You should now see ${projects.length} projects:`);
    console.log(JSON.stringify(projects, null, 2));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

linkUserToOrganization();
