# 🔧 Role Update 500 Error - Fix Guide

## The Problem:

You're getting a **500 error** when trying to update user roles in the admin panel:

```
Error: Failed to update role
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

---

## Root Cause:

The Prisma Client is out of sync with the database schema. Even though we added the board roles to the schema and pushed to the database, the TypeScript types in the Prisma Client weren't regenerated properly.

---

## ✅ The Fix:

### Step 1: Regenerate Prisma Client

```bash
cd /Users/zacharyrobards/Downloads/avfy-main

# Generate Prisma Client with new types
npx prisma generate

# Restart your dev server
npm run dev
```

### Step 2: Verify Database Schema

```bash
# Check that the database has the correct enum values
npx prisma studio
```

In Prisma Studio:
1. Open http://localhost:5555
2. Click on "User" table
3. Try to edit a user's role
4. You should see all these options:
   - USER
   - STAFF
   - ADMIN
   - BOARD_PRESIDENT
   - BOARD_VP
   - BOARD_TREASURER
   - BOARD_SECRETARY
   - BOARD_MEMBER

### Step 3: If Still Failing, Reset and Push

```bash
# Push schema again (force update)
npx prisma db push --force-reset

# This will:
# 1. Drop all data (WARNING!)
# 2. Recreate schema with correct enums
# 3. You'll need to run seed again

# Reseed the database
npx prisma db seed

# Restart dev server
npm run dev
```

---

## Other Fixes Applied:

### 1. ✅ CSP Updated for Vercel Scripts
**File**: `src/middleware.ts`

Added `https://*.vercel-scripts.com` to `connect-src` to fix the CSP violation:
```
Connecting to 'https://va.vercel-scripts.com/v1/script.debug.js' violates...
```

### 2. ✅ Better Error Logging
**File**: `src/app/api/admin/users/[id]/route.ts`

Added detailed error logging so you can see exactly what's failing:
```typescript
console.error("Error details:", {
  message: error.message,
  code: error.code,
  meta: error.meta
})
```

### 3. ⚠️ Missing Apple Touch Icon
**Note**: The 404 for `/apple-touch-icon.png` is normal if you don't have an app icon yet.

To fix (optional):
1. Create a 180x180 PNG icon
2. Save it as `public/apple-touch-icon.png`
3. Or add this to `next.config.js`:
   ```javascript
   async redirects() {
     return [
       {
         source: '/apple-touch-icon.png',
         destination: '/logo.png', // or your actual icon
         permanent: true,
       },
     ];
   },
   ```

---

## 🧪 Test the Fix:

1. **Restart your dev server**
2. **Login as admin**: http://localhost:3002/admin
3. **Go to Users page**: http://localhost:3002/admin/users
4. **Try to change a user's role** using the dropdown
5. **Check browser console** - should see detailed error if it still fails

---

## 🔍 Debugging Steps:

If it still doesn't work, check the **server terminal** (where `npm run dev` is running) for the detailed error message. You should see something like:

```
Update user role error: [Error details]
Error details: {
  message: "...",
  code: "...",
  meta: {...}
}
```

**Copy that error and share it** - it will tell us exactly what's wrong!

---

## Common Issues:

### Issue 1: "Invalid enum value"
**Solution**: Prisma Client not regenerated
```bash
npx prisma generate
```

### Issue 2: "Role must be one of: USER, STAFF, ADMIN"
**Solution**: Database enum not updated
```bash
npx prisma db push --accept-data-loss
```

### Issue 3: "Cannot read property 'role' of null"
**Solution**: User not found or database connection issue
- Check DATABASE_URL in .env
- Verify database is accessible

---

## Quick Commands Reference:

```bash
# Full reset (if nothing else works)
npx prisma db push --force-reset --accept-data-loss
npx prisma generate
npx prisma db seed
npm run dev

# Just regenerate types
npx prisma generate
npm run dev

# Check database
npx prisma studio
```

---

## ✅ After Fix:

Once working, you should be able to:
1. ✅ Select any role from dropdown
2. ✅ See "User role updated to [ROLE]" success message
3. ✅ See updated role badge immediately
4. ✅ No 500 errors in console
5. ✅ Audit log entry created (check `/admin/audit`)

---

**Run `npx prisma generate` and restart your server - that should fix it!** 🚀
