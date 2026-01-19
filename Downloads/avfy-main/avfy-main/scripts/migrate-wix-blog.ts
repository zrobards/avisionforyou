import { PrismaClient, BlogPostStatus } from "@prisma/client";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface WixPost {
  title: string;
  oldSlug: string;
  oldUrl: string;
  content: string;
  publishedAt: string;
  featuredImage?: string;
  excerpt?: string;
  authorEmail?: string;
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`  Warning: Failed to download image (${response.status}): ${url}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`  Error downloading image: ${url}`, error);
    return null;
  }
}

async function uploadToVercelBlob(buffer: Buffer, filename: string): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN environment variable is not set");
  }

  try {
    const blob = await put(`blog-images/${Date.now()}-${filename}`, buffer, {
      access: "public",
    });
    return blob.url;
  } catch (error) {
    console.error(`  Error uploading to Vercel Blob:`, error);
    throw error;
  }
}

function extractImagesFromContent(html: string): string[] {
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
  const images: string[] = [];
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    if (match[1] && (match[1].includes("wixstatic.com") || match[1].includes("wixsite.com"))) {
      images.push(match[1]);
    }
  }
  return images;
}

async function migrateContentImages(content: string): Promise<string> {
  const wixImages = extractImagesFromContent(content);
  
  if (wixImages.length === 0) {
    return content;
  }

  let newContent = content;
  console.log(`  Found ${wixImages.length} image(s) in content`);

  for (const imageUrl of wixImages) {
    try {
      const urlParts = imageUrl.split("/");
      const filename = urlParts[urlParts.length - 1] || `image-${Date.now()}.jpg`;
      const cleanFilename = filename.split("?")[0]; // Remove query params
      
      const buffer = await downloadImage(imageUrl);
      
      if (buffer) {
        const newUrl = await uploadToVercelBlob(buffer, cleanFilename);
        newContent = newContent.replace(new RegExp(imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
        console.log(`    Migrated image: ${cleanFilename}`);
      }
    } catch (error) {
      console.error(`    Failed to migrate image: ${imageUrl}`, error);
    }
  }

  return newContent;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function findOrGetAuthor(authorEmail?: string): Promise<string> {
  if (authorEmail) {
    const author = await prisma.user.findUnique({
      where: { email: authorEmail },
    });
    
    if (author) {
      return author.id;
    }
    
    console.warn(`  Warning: Author email "${authorEmail}" not found, using default admin`);
  }

  // Try to find an admin user
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (admin) {
    return admin.id;
  }

  // Fall back to any user
  const anyUser = await prisma.user.findFirst();
  
  if (!anyUser) {
    throw new Error("No users found in database. Please create at least one user before migrating blog posts.");
  }

  return anyUser.id;
}

async function migratePosts() {
  console.log("Starting Wix blog migration...\n");

  // Check for Blob token
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Error: BLOB_READ_WRITE_TOKEN environment variable is not set");
    console.log("Please set this in your .env file. Get it from Vercel Dashboard → Project Settings → Environment Variables");
    process.exit(1);
  }

  // Load posts from JSON file
  const postsFile = path.join(process.cwd(), "data", "wix-posts.json");
  
  if (!fs.existsSync(postsFile)) {
    console.error("Error: data/wix-posts.json not found");
    console.log("Please create this file with your exported Wix posts.");
    console.log("See docs/BLOG-MIGRATION-GUIDE.md for the required format.");
    process.exit(1);
  }

  const posts: WixPost[] = JSON.parse(fs.readFileSync(postsFile, "utf-8"));
  console.log(`Found ${posts.length} post(s) to migrate\n`);

  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
  };

  const redirects: { source: string; destination: string }[] = [];

  for (const post of posts) {
    console.log(`Processing: ${post.title}`);

    try {
      // Generate new slug
      const newSlug = generateSlug(post.title);

      // Check if post already exists
      const existingPost = await prisma.blogPost.findFirst({
        where: { 
          OR: [
            { title: post.title },
            { slug: newSlug },
          ]
        },
      });

      if (existingPost) {
        console.log(`  Skipped: Post with title "${post.title}" or slug "${newSlug}" already exists\n`);
        results.skipped++;
        continue;
      }

      // Find or get author
      const authorId = await findOrGetAuthor(post.authorEmail);

      // Migrate featured image
      let imageUrl = null;
      if (post.featuredImage) {
        try {
          const buffer = await downloadImage(post.featuredImage);
          if (buffer) {
            const filename = post.featuredImage.split("/").pop()?.split("?")[0] || "featured.jpg";
            imageUrl = await uploadToVercelBlob(buffer, filename);
            console.log(`  Migrated featured image`);
          }
        } catch (error) {
          console.error(`  Failed to migrate featured image:`, error);
        }
      }

      // Migrate content images
      console.log(`  Processing content...`);
      const migratedContent = await migrateContentImages(post.content);

      // Generate excerpt if not provided
      const excerpt = post.excerpt || migratedContent
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .substring(0, 200)
        .trim() + "...";

      // Create post in database
      const newPost = await prisma.blogPost.create({
        data: {
          title: post.title,
          slug: newSlug,
          content: migratedContent,
          excerpt: excerpt,
          imageUrl: imageUrl,
          status: BlogPostStatus.PUBLISHED,
          publishedAt: new Date(post.publishedAt),
          authorId: authorId,
        },
      });

      // Track redirects
      if (post.oldSlug && post.oldSlug !== newSlug) {
        redirects.push({
          source: `/post/${post.oldSlug}`,
          destination: `/blog/${newSlug}`,
        });
        redirects.push({
          source: `/blog/post/${post.oldSlug}`,
          destination: `/blog/${newSlug}`,
        });
      }

      // Also add redirect from old URL if provided
      if (post.oldUrl) {
        try {
          const urlObj = new URL(post.oldUrl);
          const pathname = urlObj.pathname;
          if (pathname && pathname !== `/blog/${newSlug}`) {
            redirects.push({
              source: pathname,
              destination: `/blog/${newSlug}`,
            });
          }
        } catch (error) {
          // Invalid URL, skip
        }
      }

      console.log(`  ✓ Created: /blog/${newSlug}\n`);
      results.success++;
    } catch (error) {
      console.error(`  ✗ Failed:`, error);
      console.error(`\n`);
      results.failed++;
    }
  }

  // Save redirects to file
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const redirectsFile = path.join(dataDir, "blog-redirects.json");
  fs.writeFileSync(redirectsFile, JSON.stringify(redirects, null, 2));

  console.log("\n=== Migration Complete ===");
  console.log(`Success: ${results.success}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`\nRedirects saved to: data/blog-redirects.json`);
  console.log("These redirects are automatically loaded by next.config.js for SEO preservation.");
}

migratePosts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
