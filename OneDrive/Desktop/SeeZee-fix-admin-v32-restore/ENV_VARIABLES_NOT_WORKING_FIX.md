# 🔧 Environment Variables Not Working - Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: Variables Set for Wrong Environment

**Problem:** Variables are set for "Production" only, but Vercel might be using a different environment.

**Solution:**
1. Go to Vercel → Environment Variables
2. For each critical variable, change from "Production" to **"All Environments"**
3. Or at minimum, set for both "Production" AND "Preview"

**Critical variables to change:**
- `AUTH_SECRET` → Set to "All Environments"
- `AUTH_URL` → Set to "All Environments"  
- `AUTH_GOOGLE_ID` → Set to "All Environments"
- `AUTH_GOOGLE_SECRET` → Set to "All Environments"
- `NEXTAUTH_URL` → Already set to "All Environments" ✅

### Issue 2: Variables Not Available at Build Time

**Problem:** Some variables need to be available during build, not just runtime.

**Solution:**
- In Vercel, when adding variables, ensure they're available for **both** "Build" and "Runtime"
- Most variables should work at runtime, but `NEXT_PUBLIC_*` variables need build time

### Issue 3: Deployment Not Redeployed

**Problem:** Variables were added but deployment wasn't redeployed.

**Solution:**
After adding/changing variables, you **MUST** redeploy:

```bash
# Option 1: Via CLI
npx vercel --prod

# Option 2: Via Git
git commit --allow-empty -m "Redeploy after env var changes"
git push origin main-project

# Option 3: Via Dashboard
# Go to Deployments → Click "..." → "Redeploy"
```

### Issue 4: Variable Name Mismatch

**Problem:** Code is looking for one name but variable is set with different name.

**Your code checks for:**
- `AUTH_GOOGLE_ID` OR `GOOGLE_CLIENT_ID` ✅ (you have both)
- `AUTH_GOOGLE_SECRET` OR `GOOGLE_CLIENT_SECRET` ✅ (you have both)
- `AUTH_SECRET` OR `NEXTAUTH_SECRET` ✅ (you have both)
- `AUTH_URL` OR `NEXTAUTH_URL` ✅ (you have both)

**This should be fine**, but ensure both variants are set.

### Issue 5: Vercel Environment Detection

**Problem:** Vercel might not be detecting the environment correctly.

**Check:**
1. Go to your deployment in Vercel
2. Check which "Environment" it's using (Production/Preview/Development)
3. Ensure variables are set for that specific environment

## 🔍 Diagnostic Steps

### Step 1: Check What Variables Are Actually Available

After deploying, visit:
```
https://see-zee.com/api/env-check
```

This will show you exactly which environment variables are available at runtime.

### Step 2: Check Deployment Logs

1. Go to: https://vercel.com/zach-robards-projects/see-zee
2. Click on latest deployment
3. Check "Build Logs" and "Runtime Logs"
4. Look for errors about missing environment variables

### Step 3: Verify Variable Values

In Vercel dashboard:
1. Go to Environment Variables
2. Click on each variable
3. Verify the value is correct (no extra spaces, correct format)
4. For `AUTH_URL` and `NEXTAUTH_URL`, ensure they're exactly: `https://see-zee.com`

## 🎯 Quick Fix Checklist

- [ ] Change `AUTH_SECRET` from "Production" to "All Environments"
- [ ] Change `AUTH_URL` from "Production" to "All Environments"
- [ ] Change `AUTH_GOOGLE_ID` from "Production" to "All Environments"
- [ ] Change `AUTH_GOOGLE_SECRET` from "Production" to "All Environments"
- [ ] Verify `AUTH_URL` value is exactly `https://see-zee.com` (no trailing slash)
- [ ] Verify `NEXTAUTH_URL` value is exactly `https://see-zee.com` (no trailing slash)
- [ ] Redeploy after making changes
- [ ] Test OAuth login after redeploy
- [ ] Check `/api/env-check` endpoint to see what's available

## 🚨 Most Likely Issue

Based on your setup, the **most likely issue** is:

**Variables are set for "Production" only, but Vercel might be using a different environment for your deployment.**

**Fix:** Change all critical variables from "Production" to **"All Environments"**

## 📝 After Fixing

1. Redeploy your project
2. Visit `https://see-zee.com/api/env-check` to verify variables are available
3. Test OAuth login
4. Check logs for any remaining errors


