# Production Authentication Checklist

## Issue: Dashboard redirects to sign-in on production but works on localhost

This indicates a production environment configuration issue, not a code issue.

## Critical Environment Variables to Check in Vercel

### 1. AUTH_URL / NEXTAUTH_URL
**MOST COMMON ISSUE**
- Must be set to your production domain
- Example: `https://see-aenbvx8ae-seanspons-projects.vercel.app`
- Or your custom domain: `https://see-zee.com`

❌ **Wrong:** `http://localhost:3000` (works locally but fails in production)
✅ **Correct:** `https://your-production-domain.vercel.app`

### 2. AUTH_SECRET / NEXTAUTH_SECRET
- Must be set in production
- Should be a long random string
- Generate with: `openssl rand -base64 32`
- **CRITICAL:** The middleware uses NextAuth's internal secret resolution
- Set **either** `AUTH_SECRET` **or** `NEXTAUTH_SECRET` in Vercel (not both)
- NextAuth will auto-detect and use whichever is available
- Do NOT manually override the secret in middleware - let NextAuth handle it

### 3. DATABASE_URL
- Must be accessible from Vercel servers
- If using local database, it won't work in production
- Check connection string includes:
  - Correct host (accessible from internet)
  - SSL mode if required
  - Correct port and credentials

### 4. Google OAuth Credentials
Production domain must be added to Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth client
3. Add **Authorized redirect URIs**:
   - `https://your-production-domain.vercel.app/api/auth/callback/google`
   - `https://see-zee.com/api/auth/callback/google` (if using custom domain)
4. Add **Authorized JavaScript origins**:
   - `https://your-production-domain.vercel.app`
   - `https://see-zee.com`

## How to Fix in Vercel

### Option 1: Vercel Dashboard
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add/Update these variables:
   ```
   AUTH_URL=https://your-production-domain.vercel.app
   DATABASE_URL=postgresql://...
   AUTH_SECRET=your-secret-here
   AUTH_GOOGLE_ID=your-google-client-id
   AUTH_GOOGLE_SECRET=your-google-client-secret
   ```
4. Redeploy your application

### Option 2: Vercel CLI
```bash
vercel env add AUTH_URL
# Enter: https://your-production-domain.vercel.app

vercel env add DATABASE_URL
# Enter your production database URL

# Redeploy
vercel --prod
```

## Testing Production Auth

### 1. Check /auth-debug endpoint
Visit: `https://your-domain.vercel.app/auth-debug`
- Shows session status
- Shows database connection
- Shows environment variable status

### 2. Check /session-test endpoint
Visit: `https://your-domain.vercel.app/session-test`
- Shows client-side session status
- Provides test navigation links

### 3. Check Vercel Logs
```bash
vercel logs
```
Look for:
- Database connection errors
- Auth configuration warnings
- Session creation failures

## Common Error Messages & Solutions

### "redirect_uri_mismatch"
**Cause:** Google OAuth redirect URI not configured for production domain
**Fix:** Add production domain to Google Cloud Console (see #4 above)

### "Configuration error"
**Cause:** AUTH_URL or NEXTAUTH_URL not set
**Fix:** Add AUTH_URL to Vercel environment variables

### Session immediately expires / redirects to login
**Cause:** DATABASE_URL not accessible from production
**Fix:** 
- Use a cloud database (not localhost)
- Check firewall rules
- Verify SSL connection settings

### "Can't reach database server"
**Cause:** Database not accessible from Vercel
**Fix:**
- If using Railway/PlanetScale/Supabase: Check connection string
- If using local DB: Must migrate to cloud database
- Add Vercel IPs to database firewall allowlist

## Quick Fix Steps

1. **Get your production URL:**
   ```bash
   vercel ls
   ```

2. **Set required environment variables in Vercel:**
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Add: `AUTH_URL` = `https://your-actual-production-url.vercel.app`
   - Add: `AUTH_SECRET` = `<generate with: openssl rand -base64 32>`
   - Add: `DATABASE_URL` = `<your production database connection string>`
   - Add: `AUTH_GOOGLE_ID` = `<your Google OAuth client ID>`
   - Add: `AUTH_GOOGLE_SECRET` = `<your Google OAuth client secret>`

3. **Update Google OAuth:**
   - Add the production callback URL to Google Console
   - Format: `https://your-production-url.vercel.app/api/auth/callback/google`

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

5. **Verify in logs:**
   - After deployment, check Vercel logs for: `🔐 Middleware token: present`
   - If you see `null`, check that AUTH_SECRET is set correctly

## Verification

After fixing, test:
1. Sign out completely
2. Clear browser cookies
3. Try signing in on production
4. Should redirect to dashboard instead of back to login

