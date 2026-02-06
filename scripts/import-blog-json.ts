import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const prisma = new PrismaClient();

type JsonAuthor = {
  name?: string;
};

type JsonPost = {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category?: string;
  readTimeMinutes?: number;
  publishedAt?: string;
  imageUrl?: string;
  author?: JsonAuthor;
};

async function main() {
  const postsPath = path.join(process.cwd(), "data", "blog-posts.json");
  if (!fs.existsSync(postsPath)) {
    throw new Error("blog-posts.json not found");
  }

  const raw = fs.readFileSync(postsPath, "utf-8");
  const posts = JSON.parse(raw) as JsonPost[];

  const adminEmail = process.env.ADMIN_EMAIL || "admin@avisionforyou.org";
  let author = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!author) {
    author = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "AVFY Admin",
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });
  }

  for (const post of posts) {
    const publishedAt = post.publishedAt ? new Date(post.publishedAt) : null;

    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || null,
        category: post.category || null,
        imageUrl: post.imageUrl || null,
        readTimeMinutes: post.readTimeMinutes || null,
        publishedAt,
        status: "PUBLISHED",
      },
      create: {
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || null,
        category: post.category || null,
        imageUrl: post.imageUrl || null,
        readTimeMinutes: post.readTimeMinutes || null,
        publishedAt,
        status: "PUBLISHED",
        authorId: author.id,
      },
    });
  }

  console.log(`Imported ${posts.length} blog posts`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
