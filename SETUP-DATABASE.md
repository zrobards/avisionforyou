# Database Setup Required

## Issue

Your `.env.local` file was missing, so the application couldn't connect to the database.

I've created a basic `.env.local` file, but you need to **configure your database URL**.

## Steps to Fix:

### Option 1: Use Your Existing Database (if you have one)

1. Open `.env.local` file
2. Replace this line:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/avfy_db"
   ```
   With your actual database connection string from:
   - Neon (recommended for production)
   - Local PostgreSQL
   - Or any other PostgreSQL database

### Option 2: Set Up a New Local Database

If you don't have a database yet:

**Using PostgreSQL locally:**
```bash
# Install PostgreSQL (if not installed)
# macOS:
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb avfy_db

# Update .env.local with:
DATABASE_URL="postgresql://postgres:@localhost:5432/avfy_db"
```

**Using Neon (cloud, recommended):**
1. Go to https://neon.tech
2. Create a free account
3. Create a new project named "AVFY"
4. Copy the connection string
5. Paste it in `.env.local` as `DATABASE_URL`

### Option 3: Use Vercel's Database URL

If you're connected to Vercel and have a database there:
```bash
# Pull environment variables from Vercel
vercel env pull .env.local
```

## After Setting Up Database:

1. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

2. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

3. **Seed the database:**
   ```bash
   npx prisma db seed
   ```

4. **Start dev server:**
   ```bash
   npm run dev
   ```

5. **Check team page:**
   Go to http://localhost:3000/team

## Verify Database Connection:

```bash
# Open Prisma Studio to browse your database
npx prisma studio
```

This will open a GUI at http://localhost:5555 where you can see all your tables and data.

---

**Once you have DATABASE_URL configured, the team members will appear on the /team page!**
