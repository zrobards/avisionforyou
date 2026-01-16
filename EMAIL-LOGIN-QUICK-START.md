# Quick Admin Access During Development & Deployment

## TL;DR - Get Admin Access Right Now

### Local (use seed data):
```bash
npm run seed
```
Then login with: `admin@avisionforyou.org` / `AdminPassword123!`

### Vercel (any deployment):
```bash
curl -X POST https://YOUR_VERCEL_URL/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"AdminPass123"}'
```

Then go to `/login` and use those credentials.

---

## Why This Works

✅ **Email/Password Login** - Always available, no OAuth setup needed  
✅ **API Endpoint** - Create admin users without database access  
✅ **Password Hashing** - Bcryptjs encryption, secure  
✅ **Works with OAuth** - Email login + Google OAuth work together  

---

## Your Deployment Workflow

1. **During Development** → Use email/password login to test admin panel
2. **Push to Vercel** → Use `/api/auth/setup-admin` to create temp admin
3. **Test Features** → Login to `/admin` with email/password
4. **Final Setup** → Configure Google OAuth for production URL when ready

---

## Details

**Credentials Provider** is configured in `/src/lib/auth.ts`

**Setup API** endpoint: `/api/auth/setup-admin/route.ts`

**Login Page** shows instructions in dev mode

**Seed Data** creates default admin at `admin@avisionforyou.org`

---

## When Ready for Final OAuth

1. Update Vercel `NEXTAUTH_URL` to your final domain
2. Update Google Cloud Console redirect URI
3. Email login continues working (users can still access admin with email)
4. Switch primary to Google OAuth

See `AUTH-SETUP.md` for full details.
