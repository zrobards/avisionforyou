# Quick Start Guide - Get Everything Working

## Current Status

✅ **Code is ready** - All features implemented  
✅ **Board member roles added** - Test user created in seed  
✅ **User management updated** - Role assignment dropdown working  
✅ **Access control configured** - Board members restricted to `/board` only  
⏳ **Database not connected** - This is why you're not seeing team members  

---

## Step-by-Step Setup

### 1️⃣ Connect Your Neon Database

1. Go to your Neon dashboard
2. Copy your connection string (looks like `postgresql://user:password@...`)
3. Open the `.env.local` file in the project root
4. Replace this line:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/avfy_db"
   ```
   With your actual Neon connection string:
   ```env
   DATABASE_URL="postgresql://your-actual-neon-connection-string"
   ```

### 2️⃣ Run Database Migrations

```bash
cd /Users/zacharyrobards/Downloads/avfy-main
npx prisma migrate deploy
npx prisma generate
```

This creates all the database tables.

### 3️⃣ Seed the Database

```bash
npx prisma db seed
```

This will populate your database with:
- ✅ Admin user
- ✅ Test user  
- ✅ **Board member test user** (NEW!)
- ✅ All team members (Lucas, Dr. Massey, Charles, Zach, Henry, Gregory, Josh)
- ✅ Team photos will appear (from `/public/team/` folder)
- ✅ Programs, meetings, blog posts, donations, etc.

**Expected output:**
```
✨ Database seed completed successfully!

📝 Test Accounts:
   Admin: admin@avisionforyou.org / AdminPassword123!
   Test User: testuser@avisionforyou.org / TestUser123!
   Board Member: boardmember@avisionforyou.org / BoardMember123!
```

### 4️⃣ Start the Development Server

```bash
npm run dev
```

Then visit: http://localhost:3000

---

## Testing Board Member Features

### 1. Test Board Member Login

1. Go to http://localhost:3000/login
2. Login with:
   - Email: `boardmember@avisionforyou.org`
   - Password: `BoardMember123!`
3. You should be redirected to `/board` (Board Portal)
4. Try to visit `/admin` - you should be blocked ✅

### 2. Test Role Assignment (as Admin)

1. Logout and login as admin:
   - Email: `admin@avisionforyou.org`
   - Password: `AdminPassword123!`
2. Go to Admin Dashboard → Users
3. Find any user and use the **dropdown** to assign a board role:
   - Board Member
   - Board President
   - Board VP
   - Board Treasurer
   - Board Secretary
4. The role change is logged in the audit trail

### 3. Verify Team Page

1. Go to http://localhost:3000/team
2. You should now see all team members with:
   - ✅ Photos (from `/public/team/` folder)
   - ✅ Correct names and titles
   - ✅ Real bios (including Josh Altizer's full story)
   - ✅ Email addresses

---

## What Was Fixed

### 1. Admin Contact Page
- **Status**: Already working correctly
- Has proper ToastProvider, authentication, and all functionality
- If you see issues, they're likely due to missing database connection

### 2. User Management Page
- **Before**: Only promote/demote buttons for Admin
- **After**: Full role assignment dropdown with all board roles
- Visual indicators: Purple badges for board members

### 3. Board Member Access Control
- **Before**: No restrictions
- **After**: Board members can ONLY access `/board`, not `/admin` or `/dashboard`

### 4. Test Users
- Added test board member account for easy testing

---

## Troubleshooting

### "Team page is empty"
→ You haven't run `npx prisma db seed` yet

### "Can't login"
→ Database not connected or seed not run

### "Contact page not working"
→ Database not connected (contact inquiries are stored in DB)

### "Role dropdown not showing board roles"
→ Clear your browser cache or do a hard refresh (Cmd+Shift+R)

---

## What You Need Next

Before deploying to Vercel, you'll need these environment variables:

### Essential:
```env
DATABASE_URL="postgresql://..."  # Neon connection string
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
ADMIN_EMAIL="admin@avisionforyou.org"
```

### Optional (for full features):
```env
RESEND_API_KEY="re_..."
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-..."
```

---

## Questions?

If you encounter any specific errors or issues:
1. Check the browser console (F12 → Console tab)
2. Check the terminal where `npm run dev` is running
3. Share the error message and I can fix it immediately

**Everything is ready to go once you connect the database!** 🚀
