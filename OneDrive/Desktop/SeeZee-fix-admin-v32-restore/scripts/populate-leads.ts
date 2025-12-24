// Use require since scripts don't have path aliases
const { db } = require('../src/server/db');
const { importIRSData } = require('../src/lib/leads/irs-importer');
const { checkWebsite } = require('../src/lib/leads/website-checker');
const { calculateLeadScore } = require('../src/lib/leads/scoring');

async function populateLeads() {
  console.log('🚀 Starting lead population workflow...');

  // Step 1: Import from IRS
  console.log('\n📥 Step 1: Importing IRS data...');
  const importResult = await importIRSData('KY', 100);
  console.log(`Imported: ${importResult.imported}, Skipped: ${importResult.skipped}`);

  // Step 2: Find leads that might have websites
  console.log('\n🔍 Step 2: Searching for websites...');
  const leads = await db.lead.findMany({
    where: {
      hasWebsite: false,
      websiteUrl: null
    },
    take: 50
  });

  for (const lead of leads) {
    // Try to find website via common patterns
    const possibleUrls = [
      `https://${lead.name.toLowerCase().replace(/\s+/g, '')}.org`,
      `https://${lead.name.toLowerCase().replace(/\s+/g, '')}.com`,
      `https://www.${lead.name.toLowerCase().replace(/\s+/g, '')}.org`
    ];
    
    for (const possibleUrl of possibleUrls) {
      try {
        const response = await fetch(possibleUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        if (response.ok) {
          await db.lead.update({
            where: { id: lead.id },
            data: { websiteUrl: possibleUrl }
          });
          console.log(`Found website for ${lead.name}: ${possibleUrl}`);
          break;
        }
      } catch {
        // Website doesn't exist, try next pattern
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Step 3: Check website quality for leads with websites
  console.log('\n🌐 Step 3: Checking website quality...');
  const leadsWithWebsites = await db.lead.findMany({
    where: {
      websiteUrl: { not: null },
      websiteQuality: null
    },
    take: 25
  });

  for (const lead of leadsWithWebsites) {
    try {
      const analysis = await checkWebsite(lead.websiteUrl!);
      
      await db.lead.update({
        where: { id: lead.id },
        data: {
          hasWebsite: true,
          websiteQuality: analysis.quality,
          needsAssessment: {
            issues: analysis.issues,
            scores: analysis.scores,
            checkedAt: new Date().toISOString()
          } as any
        }
      });

      console.log(`Checked ${lead.name}: ${analysis.quality}`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error checking ${lead.name}:`, error);
    }
  }

  // Step 4: Calculate lead scores
  console.log('\n📊 Step 4: Calculating lead scores...');
  const allLeads = await db.lead.findMany();

  for (const lead of allLeads) {
    const score = calculateLeadScore(lead);
    await db.lead.update({
      where: { id: lead.id },
      data: { leadScore: score }
    });
  }

  console.log(`✅ Scored ${allLeads.length} leads`);

  // Step 5: Show statistics
  console.log('\n📈 Final Statistics:');
  const hot = allLeads.filter((l: any) => l.leadScore >= 80).length;
  const warm = allLeads.filter((l: any) => l.leadScore >= 60 && l.leadScore < 80).length;
  const cold = allLeads.filter((l: any) => l.leadScore < 60).length;

  console.log(`🔥 Hot leads (80+): ${hot}`);
  console.log(`🟡 Warm leads (60-79): ${warm}`);
  console.log(`🟦 Cold leads (0-59): ${cold}`);
  
  console.log('\n✅ Lead population complete!');
}

populateLeads()
  .catch(console.error)
  .finally(() => process.exit());
