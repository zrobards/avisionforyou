# 🔧 Missing Vercel Environment Variables

## Critical Missing Variables

Based on your Vercel environment variables page, you're missing these **critical** variables that are causing OAuth errors:

### 1. Authentication Secret (REQUIRED)
```
AUTH_SECRET=[Generate a new 32+ byte random string]
```
**OR**
```
NEXTAUTH_SECRET=[Generate a new 32+ byte random string]
```

**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Authentication URL (REQUIRED)
```
AUTH_URL=https://see-zee.com
```
**OR**
```
NEXTAUTH_URL=https://see-zee.com
```

### 3. Google OAuth Client ID (REQUIRED)
```
AUTH_GOOGLE_ID=[Your Google OAuth Client ID]
```
**OR**
```
GOOGLE_CLIENT_ID=[Your Google OAuth Client ID]
```

### 4. Google OAuth Client Secret (REQUIRED)
```
AUTH_GOOGLE_SECRET=[Your Google OAuth Client Secret]
```
**OR**
```
GOOGLE_CLIENT_SECRET=[Your Google OAuth Client Secret]
```

### 5. Database URL (REQUIRED)
```
DATABASE_URL=[Your production PostgreSQL connection string]
```

## How to Add in Vercel

### Option 1: Vercel Dashboard (Recommended)
1. Go to your project: https://vercel.com/zach-robards-projects/see-zee/settings/environment-variables
2. Click **"Create new"** for each variable above
3. Set **Environment** to **"All Environments"** (or at least "Production")
4. Mark sensitive variables as **"Sensitive"**
5. Click **"Save"**
6. **Redeploy** your project after adding all variables

### Option 2: Vercel CLI
```bash
# Generate AUTH_SECRET first
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Then add each variable (replace values with your actual values)
npx vercel env add AUTH_SECRET production
npx vercel env add AUTH_URL production
npx vercel env add AUTH_GOOGLE_ID production
npx vercel env add AUTH_GOOGLE_SECRET production
npx vercel env add DATABASE_URL production

# Redeploy
npx vercel --prod
```

## Google OAuth Setup

After adding the environment variables, verify your Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Ensure **Authorized redirect URIs** includes:
   - `https://see-zee.com/api/auth/callback/google`
   - `https://www.see-zee.com/api/auth/callback/google`
4. Ensure **Authorized JavaScript origins** includes:
   - `https://see-zee.com`
   - `https://www.see-zee.com`

## Current Status

✅ **Already Set:**
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `GITHUB_TOKEN`
- `OPENAI_API_KEY`
- `GOOGLE_MAPS_API_KEY`
- And others...

❌ **Missing (Causing OAuth Errors):**
- `AUTH_SECRET` or `NEXTAUTH_SECRET`
- `AUTH_URL` or `NEXTAUTH_URL`
- `AUTH_GOOGLE_ID` or `GOOGLE_CLIENT_ID`
- `AUTH_GOOGLE_SECRET` or `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL`

## After Adding Variables

1. **Redeploy** your project (Vercel will automatically redeploy if you trigger a new deployment)
2. **Test OAuth login** - The errors should be resolved
3. **Check logs** - The improved error logging will show if there are any remaining issues

## Quick Test

After adding all variables, test by:
1. Going to https://see-zee.com/login
2. Clicking "Sign in with Google"
3. The OAuth flow should complete without errors




