# Blog Migration Guide: Wix to AVFY

## Step 1: Export Posts from Wix

### Option A: Manual CSV Export
1. Log into Wix Dashboard
2. Go to Blog Manager
3. Export posts (if available)
4. Save as CSV with columns: title, slug, content, date, featuredImage

### Option B: Copy Manually
For each post, record:
- Title
- URL/slug (e.g., /post/my-blog-post)
- Content (HTML)
- Publish date
- Featured image URL

Save as JSON file: `/data/wix-posts.json`

Example format:
```json
[
  {
    "title": "Welcome to AVFY",
    "oldSlug": "welcome-to-avfy",
    "oldUrl": "https://avfy.wixsite.com/blog/post/welcome-to-avfy",
    "content": "<p>HTML content here...</p>",
    "publishedAt": "2024-06-15",
    "featuredImage": "https://static.wixstatic.com/media/abc123.jpg",
    "excerpt": "Short description",
    "authorEmail": "admin@avfy.org"
  }
]
```

**Important Notes:**
- `authorEmail` must match an existing user in the database (the migration script will find the user by email)
- If no author is specified, the script will attempt to find the first ADMIN user
- All posts will be set to PUBLISHED status

## Step 2: Install Dependencies

Before running the migration, install the required package:

```bash
npm install @vercel/blob
```

Ensure you have `BLOB_READ_WRITE_TOKEN` set in your `.env` file. Get this from your Vercel dashboard → Project Settings → Environment Variables.

## Step 3: Run Migration Script

```bash
npx ts-node scripts/migrate-wix-blog.ts
```

The script will:
1. Load posts from `/data/wix-posts.json`
2. Download all images from Wix URLs
3. Upload images to Vercel Blob storage
4. Update content to use new image URLs
5. Create blog posts in the database
6. Generate redirect mappings for SEO

## Step 4: Verify Posts

1. Check `/blog` page shows all migrated posts
2. Check individual post pages render correctly
3. Check images load properly
4. Check old URLs redirect correctly

## Step 5: Update Internal Links

After migration, update any internal links within blog posts:

```bash
npx ts-node scripts/update-internal-links.ts
```

This will find and replace old Wix URLs with new blog URLs.

## Step 6: Deploy Redirects

The migration script creates `/data/blog-redirects.json` with all redirect mappings. These are automatically loaded by `next.config.js` on build.

If you need to add manual redirects, add them to the `redirects()` function in `next.config.js`.

## Troubleshooting

### Images Not Migrating
- Check that `BLOB_READ_WRITE_TOKEN` is set correctly
- Verify Wix image URLs are accessible (they may expire)
- Check network connectivity

### Author Not Found
- Ensure the `authorEmail` in your JSON matches a user in the database
- Or ensure there's at least one ADMIN user in the database

### Duplicate Posts
- The script checks for existing posts by title and slug
- Duplicates are skipped automatically
