# NextAuth v5 Environment Variables Fix

## You're Using NextAuth v5 (beta.29)

NextAuth v5 has **different requirements** than v4. Here's what you need:

## ✅ Required Environment Variables for NextAuth v5

### 1. AUTH_SECRET (REQUIRED)
```
AUTH_SECRET=your-secret-here
```
- **Must be set** for v5 to work
- Can also use `NEXTAUTH_SECRET` (for compatibility)
- Should be 32+ characters

### 2. AUTH_URL (REQUIRED for OAuth)
```
AUTH_URL=https://see-zee.com
```
- **Critical for OAuth callbacks** in v5
- Must match your production domain exactly
- No trailing slash
- Can also use `NEXTAUTH_URL` (for compatibility)

### 3. Google OAuth
```
AUTH_GOOGLE_ID=your-client-id
AUTH_GOOGLE_SECRET=your-client-secret
```
- Or use `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

## 🔧 NextAuth v5 Specific Configuration

Your code has `trustHost: true` which is good for v5, but you still need:

1. **AUTH_SECRET** - Must be set (v5 requires this)
2. **AUTH_URL** - Must be set for OAuth (v5 uses this for callbacks)

## ⚠️ Common v5 Issues

### Issue 1: Missing AUTH_SECRET
**Error:** "AUTH_SECRET is required"
**Fix:** Set `AUTH_SECRET` in Vercel environment variables

### Issue 2: Wrong AUTH_URL
**Error:** OAuth callbacks fail
**Fix:** Set `AUTH_URL=https://see-zee.com` (exact match, no trailing slash)

### Issue 3: trustHost Not Working
**Error:** Configuration errors
**Fix:** Ensure `AUTH_URL` is set even with `trustHost: true`

## 🎯 Quick Fix for Your Setup

Based on your Vercel environment variables:

1. **Ensure AUTH_SECRET is set for "All Environments"**
   - Currently: Set for "Production" only
   - Change to: "All Environments"

2. **Ensure AUTH_URL is set for "All Environments"**
   - Currently: Set for "Production" only  
   - Change to: "All Environments"
   - Value: `https://see-zee.com` (verify no trailing slash)

3. **Redeploy after changes**

## 📝 NextAuth v5 vs v4 Differences

| Feature | v4 | v5 |
|---------|----|----|
| Secret | `NEXTAUTH_SECRET` | `AUTH_SECRET` (preferred) |
| URL | `NEXTAUTH_URL` | `AUTH_URL` (preferred) |
| trustHost | Not available | Available (helps with URL detection) |
| Configuration | Different API | New unified API |

## ✅ Your Current Setup

Looking at your `auth.ts`:
- ✅ Using `trustHost: true` (good for v5)
- ✅ Checking both `AUTH_SECRET` and `NEXTAUTH_SECRET` (compatible)
- ✅ Checking both `AUTH_URL` and `NEXTAUTH_URL` (compatible)
- ✅ Using PrismaAdapter correctly

**The issue is likely:**
- Variables set for "Production" only
- Need to be set for "All Environments"
- Or deployment is using wrong environment

## 🚀 Action Items

1. In Vercel, change these to "All Environments":
   - `AUTH_SECRET`
   - `AUTH_URL`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`

2. Verify values:
   - `AUTH_URL` = `https://see-zee.com` (exact, no trailing slash)
   - `AUTH_SECRET` = long random string (32+ chars)

3. Redeploy:
   ```bash
   npx vercel --prod
   ```

4. Test:
   - Visit `https://see-zee.com/api/env-check` to verify variables
   - Test OAuth login

## 🔍 Diagnostic

After redeploying, check:
```
https://see-zee.com/api/env-check
```

This will show you exactly which variables are available at runtime.


