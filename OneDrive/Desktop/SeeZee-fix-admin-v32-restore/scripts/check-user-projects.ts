import { prisma } from '../src/lib/prisma';

async function checkUserProjects() {
  try {
    // Check user
    const user = await prisma.user.findFirst({
      where: { email: 'sean@seezee.studio' }
    });
    
    console.log('\n=== USER ===');
    console.log(JSON.stringify({ 
      id: user?.id, 
      email: user?.email, 
      name: user?.name 
    }, null, 2));
    
    if (!user) {
      console.log('\nNo user found!');
      await prisma.$disconnect();
      return;
    }
    
    // Check organization memberships
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: user.id }
    });
    
    console.log('\n=== ORGANIZATION MEMBERSHIPS ===');
    console.log(JSON.stringify(memberships, null, 2));
    
    // Check leads
    const leads = await prisma.lead.findMany({
      where: { email: user.email }
    });
    
    console.log('\n=== LEADS ===');
    console.log(JSON.stringify(leads.map(l => ({
      id: l.id,
      email: l.email,
      orgId: l.organizationId,
      projectId: l.projectId
    })), null, 2));
    
    // Check projects
    const orgIds = memberships.map(m => m.organizationId).filter(Boolean);
    
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { lead: { email: user.email } },
          ...(orgIds.length > 0 ? [{ organizationId: { in: orgIds } }] : [])
        ]
      },
      select: {
        id: true,
        name: true,
        status: true,
        organizationId: true,
        leadId: true
      }
    });
    
    console.log('\n=== PROJECTS ===');
    console.log(JSON.stringify(projects, null, 2));
    console.log(`\nTotal projects found: ${projects.length}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkUserProjects();
