# Admin Login Setup - Quick Reference

## Status: ✅ FIXED

The admin login issue has been resolved. Here's how to log in:

## Login Credentials

### Primary Admin Account
```
Email:    admin@avisionforyou.org
Password: AdminPassword123!
```

### Test Accounts (Optional)
```
john@example.com / TestPassword123!
sarah@example.com / TestPassword123!
michael@example.com / TestPassword123!
jessica@example.com / TestPassword123!
david@example.com / TestPassword123!
```

## How to Log In

1. Go to `http://localhost:3000/login`
2. Click "Or continue with email" section
3. Enter:
   - **Email**: admin@avisionforyou.org
   - **Password**: AdminPassword123!
4. Click "Sign in with Email"
5. You'll be redirected to `/dashboard` (or `/admin` for admin-specific page)

## What Was Fixed

### Issue
The credentials provider was using `require('bcryptjs')` inside the function, which could cause reliability issues.

### Solution
1. **Added proper bcryptjs import** at the top of `src/lib/auth.ts`
2. **Added detailed logging** to identify auth failures
3. **Improved error handling** to distinguish between different failure modes
4. **Seeded the database** with admin user

### Changes Made
- ✅ `src/lib/auth.ts` - Fixed bcryptjs import and added logging
- ✅ Database seeded with admin credentials
- ✅ `package.json` - Added ts-node for reliable seeding
- ✅ Prisma seed configuration added

## Testing Steps

1. **Start the dev server**
   ```bash
   npm run dev
   ```

2. **Access login page**
   ```
   http://localhost:3000/login
   ```

3. **Try admin login**
   - Email: admin@avisionforyou.org
   - Password: AdminPassword123!

4. **Should see**
   - Redirect to dashboard/admin area
   - Ability to access admin pages (meetings, users, donations, etc.)

## Database Seeding

If you need to reset the database and reseed:

```bash
# Reseed the database
npm run seed

# Or use Prisma directly
npx prisma db seed
```

## Troubleshooting

### Login still fails?
1. **Check server logs** - Look for auth debug messages
2. **Verify admin user exists**:
   ```bash
   npx prisma studio
   # Go to Users table and check for admin@avisionforyou.org
   ```
3. **Check bcryptjs is installed**:
   ```bash
   npm list bcryptjs
   ```

### Password not working?
1. The password is **case-sensitive** and **exact**: `AdminPassword123!`
2. If you still can't log in, reseed: `npm run seed`

### Getting "Invalid credentials" error?
1. Verify email is: `admin@avisionforyou.org` (exact, lowercase)
2. Verify password is: `AdminPassword123!` (exact, with capital A and exclamation mark)
3. Check server console for specific error messages

## Admin Access

Once logged in as admin (admin@avisionforyou.org), you can access:

- `/admin` - Admin dashboard
- `/admin/meetings` - Manage meetings
- `/admin/users` - Manage users
- `/admin/donations` - View donations
- `/admin/analytics` - Analytics
- And more...

## Security Notes

⚠️ **Development Only**
- These are development credentials
- Change them in production
- Never commit real admin passwords to version control
- Use environment variables for production credentials

## Next Steps

1. Log in with admin credentials
2. Test the admin interface
3. Create additional users if needed
4. Set up your own admin account for production

---

**Need help?** Check the console logs at the bottom of the dev terminal for authentication debug messages.
