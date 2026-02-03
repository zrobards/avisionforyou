import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateInternalLinks() {
  console.log("Updating internal links in blog posts...\n");

  const posts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
    },
  });

  console.log(`Found ${posts.length} published post(s) to check\n`);

  let updatedCount = 0;

  for (const post of posts) {
    let content = post.content;
    let updated = false;

    // Replace old Wix URLs with new URLs
    const patterns = [
      // Full Wix URLs
      {
        regex: /https?:\/\/avfy\.wixsite\.com\/[^/]+\/post\/([^"'\s\)]+)/g,
        replacement: "/blog/$1",
      },
      // Wixsite.com URLs
      {
        regex: /https?:\/\/([^/]+)\.wixsite\.com\/[^/]+\/post\/([^"'\s\)]+)/g,
        replacement: "/blog/$2",
      },
      // Relative post URLs
      {
        regex: /href=["']\/post\/([^"'\s\)]+)["']/g,
        replacement: 'href="/blog/$1"',
      },
      // Blog post URLs (old format)
      {
        regex: /href=["']\/blog\/post\/([^"'\s\)]+)["']/g,
        replacement: 'href="/blog/$1"',
      },
    ];

    for (const pattern of patterns) {
      const newContent = content.replace(pattern.regex, pattern.replacement);
      if (newContent !== content) {
        content = newContent;
        updated = true;
      }
    }

    if (updated) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { content },
      });
      console.log(`✓ Updated links in: ${post.title}`);
      updatedCount++;
    } else {
      console.log(`- No updates needed: ${post.title}`);
    }
  }

  console.log(`\n=== Update Complete ===`);
  console.log(`Posts updated: ${updatedCount}`);
  console.log(`Posts unchanged: ${posts.length - updatedCount}`);
}

updateInternalLinks()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
