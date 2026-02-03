# Fix: Social Stats Table Missing in Production

## The Problem
The error "The table `public.social_stats` does not exist" means the migration hasn't been applied to your production database.

## Solution 1: Automatic (Recommended)
The build script has been updated to run migrations automatically. When Vercel deploys, it will:
1. Run `prisma generate`
2. Run `prisma migrate deploy` (creates the table)
3. Build the Next.js app

**Just wait for the next deployment to complete!**

## Solution 2: Manual Migration (If automatic doesn't work)

### Option A: Via Vercel CLI
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run migration
npx prisma migrate deploy
```

### Option B: Direct SQL (Fastest)
If you have access to your Neon database, run this SQL directly:

```sql
CREATE TABLE IF NOT EXISTS "social_stats" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "handle" TEXT,
    "url" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "social_stats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "social_stats_platform_key" ON "social_stats"("platform");
```

### Option C: Via Neon Dashboard
1. Go to https://console.neon.tech
2. Select your project
3. Go to SQL Editor
4. Paste the SQL above
5. Run it

## Verify It Worked
After the migration runs, test by:
1. Going to `/admin/social-stats`
2. Updating follower counts
3. Clicking "Save Updates"
4. It should work without errors!

## Current Status
✅ Migration file created: `prisma/migrations/20260101215137_add_social_stats/migration.sql`
✅ Build script updated to run migrations automatically
✅ Pushed to GitHub - Vercel will deploy automatically

