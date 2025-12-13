/**
 * Seed CEO Links - Add useful links for CEO access
 * Run with: npx tsx scripts/seed-ceo-links.ts
 */

import { PrismaClient, LinkCategory } from '@prisma/client';

const prisma = new PrismaClient();

const usefulLinks = [
  // AI Tools
  {
    title: 'ChatGPT',
    url: 'https://chat.openai.com',
    description: 'OpenAI ChatGPT - AI assistant for coding, writing, and more',
    category: 'TOOLS' as LinkCategory,
    icon: '🤖',
    pinned: true,
  },
  {
    title: 'Claude AI',
    url: 'https://claude.ai',
    description: 'Anthropic Claude - Advanced AI assistant',
    category: 'TOOLS' as LinkCategory,
    icon: '🧠',
    pinned: true,
  },
  {
    title: 'Cursor',
    url: 'https://cursor.sh',
    description: 'Cursor IDE - AI-powered code editor',
    category: 'DEVELOPMENT' as LinkCategory,
    icon: '⌨️',
    pinned: true,
  },
  {
    title: 'VS Code',
    url: 'https://code.visualstudio.com',
    description: 'Visual Studio Code - Code editor',
    category: 'DEVELOPMENT' as LinkCategory,
    icon: '💻',
    pinned: true,
  },
  
  // Database & Infrastructure
  {
    title: 'Vercel Dashboard',
    url: 'https://vercel.com/dashboard',
    description: 'Vercel deployment and hosting dashboard',
    category: 'DEVELOPMENT' as LinkCategory,
    icon: '▲',
    pinned: true,
  },
  {
    title: 'Supabase Dashboard',
    url: 'https://app.supabase.com',
    description: 'Supabase - PostgreSQL database and backend',
    category: 'DEVELOPMENT' as LinkCategory,
    icon: '🗄️',
    pinned: true,
  },
  {
    title: 'PlanetScale',
    url: 'https://planetscale.com',
    description: 'PlanetScale - MySQL database platform',
    category: 'DEVELOPMENT' as LinkCategory,
    icon: '🌍',
  },
  {
    title: 'Prisma Studio',
    url: 'http://localhost:5555',
    description: 'Prisma Studio - Database GUI (local)',
    category: 'DEVELOPMENT' as LinkCategory,
    icon: '🎨',
  },
  
  // Payment & Business
  {
    title: 'Stripe Dashboard',
    url: 'https://dashboard.stripe.com',
    description: 'Stripe payment processing dashboard',
    category: 'TOOLS' as LinkCategory,
    icon: '💳',
    pinned: true,
  },
  {
    title: 'Stripe API Docs',
    url: 'https://stripe.com/docs/api',
    description: 'Stripe API documentation',
    category: 'DOCUMENTATION' as LinkCategory,
    icon: '📖',
  },
  
  // Development Tools
  {
    title: 'GitHub',
    url: 'https://github.com',
    description: 'GitHub - Code repository and version control',
    category: 'DEVELOPMENT' as LinkCategory,
    icon: '🐙',
    pinned: true,
  },
  {
    title: 'GitHub Actions',
    url: 'https://github.com/features/actions',
    description: 'GitHub Actions - CI/CD workflows',
    category: 'DEVELOPMENT' as LinkCategory,
    icon: '⚡',
  },
  {
    title: 'Figma',
    url: 'https://figma.com',
    description: 'Figma - Design and prototyping tool',
    category: 'DESIGN' as LinkCategory,
    icon: '🎨',
    pinned: true,
  },
  {
    title: 'Notion',
    url: 'https://notion.so',
    description: 'Notion - All-in-one workspace',
    category: 'TOOLS' as LinkCategory,
    icon: '📝',
  },
  
  // Documentation
  {
    title: 'Next.js Docs',
    url: 'https://nextjs.org/docs',
    description: 'Next.js framework documentation',
    category: 'DOCUMENTATION' as LinkCategory,
    icon: '▲',
  },
  {
    title: 'React Docs',
    url: 'https://react.dev',
    description: 'React library documentation',
    category: 'DOCUMENTATION' as LinkCategory,
    icon: '⚛️',
  },
  {
    title: 'TypeScript Docs',
    url: 'https://www.typescriptlang.org/docs',
    description: 'TypeScript language documentation',
    category: 'DOCUMENTATION' as LinkCategory,
    icon: '📘',
  },
  {
    title: 'Prisma Docs',
    url: 'https://www.prisma.io/docs',
    description: 'Prisma ORM documentation',
    category: 'DOCUMENTATION' as LinkCategory,
    icon: '🗄️',
  },
  {
    title: 'Tailwind CSS Docs',
    url: 'https://tailwindcss.com/docs',
    description: 'Tailwind CSS utility-first CSS framework',
    category: 'DOCUMENTATION' as LinkCategory,
    icon: '🎨',
  },
  
  // Marketing & Analytics
  {
    title: 'Google Analytics',
    url: 'https://analytics.google.com',
    description: 'Google Analytics - Web analytics platform',
    category: 'MARKETING' as LinkCategory,
    icon: '📊',
  },
  {
    title: 'Google Search Console',
    url: 'https://search.google.com/search-console',
    description: 'Google Search Console - SEO and search performance',
    category: 'MARKETING' as LinkCategory,
    icon: '🔍',
  },
  
  // Other Useful Tools
  {
    title: 'Postman',
    url: 'https://postman.com',
    description: 'Postman - API development and testing',
    category: 'DEVELOPMENT' as LinkCategory,
    icon: '📮',
  },
  {
    title: 'Linear',
    url: 'https://linear.app',
    description: 'Linear - Issue tracking and project management',
    category: 'TOOLS' as LinkCategory,
    icon: '📋',
  },
  {
    title: '1Password',
    url: 'https://1password.com',
    description: '1Password - Password manager',
    category: 'TOOLS' as LinkCategory,
    icon: '🔐',
  },
  {
    title: 'Cloudflare',
    url: 'https://dash.cloudflare.com',
    description: 'Cloudflare - CDN and security',
    category: 'TOOLS' as LinkCategory,
    icon: '☁️',
  },
];

async function main() {
  console.log('🌱 Seeding CEO Links...\n');

  let created = 0;
  let skipped = 0;

  for (const linkData of usefulLinks) {
    try {
      // Check if link already exists by URL
      const existing = await prisma.link.findFirst({
        where: { url: linkData.url },
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${linkData.title} (already exists)`);
        skipped++;
        continue;
      }

      await prisma.link.create({
        data: {
          title: linkData.title,
          url: linkData.url,
          description: linkData.description,
          category: linkData.category,
          icon: linkData.icon,
          pinned: linkData.pinned || false,
          order: linkData.pinned ? 0 : 100,
        },
      });

      console.log(`✅ Created: ${linkData.title}`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating ${linkData.title}:`, error);
    }
  }

  console.log(`\n🎉 Done! Created ${created} links, skipped ${skipped} existing links.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

