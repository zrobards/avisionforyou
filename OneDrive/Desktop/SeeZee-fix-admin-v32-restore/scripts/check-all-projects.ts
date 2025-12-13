import { prisma } from '../src/lib/prisma';

async function checkAllProjects() {
  try {
    // Get all projects
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        organizationId: true,
        leadId: true,
        lead: {
          select: {
            email: true,
            name: true
          }
        },
        organization: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log(`\n=== ALL PROJECTS (${projects.length} total) ===`);
    console.log(JSON.stringify(projects, null, 2));
    
    // Get all organizations
    const orgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      }
    });
    
    console.log(`\n=== ALL ORGANIZATIONS (${orgs.length} total) ===`);
    console.log(JSON.stringify(orgs, null, 2));
    
    // Get all leads
    const leads = await prisma.lead.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        organizationId: true,
        projectId: true
      }
    });
    
    console.log(`\n=== ALL LEADS (${leads.length} total) ===`);
    console.log(JSON.stringify(leads, null, 2));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkAllProjects();
