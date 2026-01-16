# HOW TO SEE THE TEAM PAGE WITH PHOTOS AND BIOS

## ⚠️ IMPORTANT: You MUST run the seed command!

The team member data is in the seed file, but you need to actually run it to populate the database.

## Steps to Fix:

### 1. Stop your dev server (if running)
Press `Ctrl+C` in the terminal where `npm run dev` is running

### 2. Clear old data and reseed (IMPORTANT!)
```bash
cd /Users/zacharyrobards/Downloads/avfy-main

# Reset the database (this will clear ALL data)
npx prisma migrate reset --force

# This will:
# 1. Drop the database
# 2. Recreate it
# 3. Run all migrations
# 4. Run the seed script automatically
```

**OR** if you want to keep existing data and just add team members:

```bash
# Just run the seed (won't delete existing data)
npx prisma db seed
```

### 3. Start the dev server
```bash
npm run dev
```

### 4. Visit the team page
Go to: http://localhost:3000/team

You should now see:
- ✅ 4 Board Members with photos and full bios
- ✅ 4 Staff Members with photos and full bios
- ✅ Photos for all 8 team members
- ✅ Email and credentials displayed

## What You'll See:

### Executive Leadership Section
1. **Gregory Haynes** - Board President & Founder
   - Photo: /team/gregory-haynes.png
   - Full bio about founding AVFY

2. **Charles Moore** - Board Vice President
   - Photo: /team/charles-moore.png
   - Bio about nonprofit governance

3. **Henry Fuqua** - Board Treasurer
   - Photo: /team/henry-fuqua.png
   - Bio about financial management

4. **Evan Massey** - Board Secretary
   - Photo: /team/evan-massey.png
   - Bio about legal compliance

### Our Staff Section
5. **Lucas Bennett** - Executive Director
   - Photo: /team/lucas-bennett.png
   - Bio about operations and program development

6. **Josh Altizer** - Program Director - MindBodySoul IOP
   - Photo: /team/josh-altizer.png
   - Bio about clinical excellence

7. **Zach Wilbert** - Surrender Program Manager
   - Photo: /team/zach-wilbert.png
   - Bio about peer recovery

8. **Steven Furlow** - Director of Community Engagement
   - Photo: /team/steven-furlow.png
   - Bio about community partnerships

## Troubleshooting

### If you still don't see team members:

1. **Check database connection:**
   ```bash
   npx prisma studio
   ```
   Open Prisma Studio and look at the `TeamMember` table. Should have 8 records.

2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Check browser console:**
   - Open browser DevTools (F12)
   - Look for any errors
   - Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### If photos don't show:

All photos are in `/public/team/` and should work automatically. If not:
- Make sure files exist in `/public/team/`
- Check file names match exactly (lowercase, with hyphens)
- Try hard refresh in browser

## What the seed does:

The seed file (`prisma/seed.ts`) creates:
- ✅ 8 team members with full data
- ✅ Image URLs pointing to `/team/*.png` files
- ✅ Complete bios (150-200 words each)
- ✅ Credentials and contact information
- ✅ Proper role assignments (BOARD_* and STAFF)

## After seeding, you can also check:

- Admin panel: http://localhost:3000/admin/team
- Should see all 8 members there too
- Can edit/add more through admin interface

---

**That's it! After running the seed, your team page will be fully populated with photos and bios!** 🎉
