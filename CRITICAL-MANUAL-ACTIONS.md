# ⚠️ CRITICAL MANUAL ACTIONS CHECKLIST

## Before Deploying to Production - DO THESE NOW

### 1. 🔴 ROTATE DATABASE PASSWORD (10 minutes)

**Current Status**: Database credentials exposed in git history  
**Risk Level**: CRITICAL

**Steps**:
1. Visit: https://console.neon.tech
2. Select your project: `ep-tiny-flower-ahzuiffh`
3. Go to Settings → Reset Password
4. Copy the NEW connection string
5. Update Vercel environment variables (next step)
6. Test connection locally

**DO NOT commit new credentials to git!**

---

### 2. 🔴 SET VERCEL ENVIRONMENT VARIABLES (5 minutes)

**Location**: Vercel Dashboard → Your Project → Settings → Environment Variables

**Required Variables for Production**:

```bash
# Database - USE NEW PASSWORD FROM STEP 1
DATABASE_URL=postgresql://neondb_owner:NEW_PASSWORD_HERE@ep-tiny-flower-ahzuiffh-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Auth - Already secure locally
NEXTAUTH_SECRET=4GZ2S4IN7qWfWOo96/jchlaWGZokjjtmyHgvvHLaeVI=

# Update with your production domain
NEXTAUTH_URL=https://your-production-domain.vercel.app

# Generate new cron secret
CRON_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))">

# Admin email for auto-promotion (optional)
ADMIN_EMAIL=admin@avisionforyou.org
```

**How to add in Vercel**:
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Click "Add New"
5. Name: `DATABASE_URL`, Value: `<paste_new_connection_string>`, Environment: Production
6. Repeat for each variable above
7. Click "Save"

---

### 3. 🟡 GENERATE CRON_SECRET (2 minutes)

Run this command to generate secure CRON_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and add it to Vercel environment variables.

---

### 4. 🟡 OPTIONAL: Clean Git History (30 minutes)

**Warning**: This rewrites git history. Coordinate with your team first!

**Why**: Remove exposed credentials from all historical commits

**Command**:
```bash
cd /Users/zacharyrobards/Downloads/avisionforyou-main-project/Downloads/avfy-main/avfy-main

# Backup first
git branch backup-before-filter-branch

# Remove .env.local from ALL commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Cleanup
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: affects all team members)
git push origin --force --all
git push origin --force --tags
```

**Alternative (Easier)**: Just rotate the database password and move on. Since .env.local is already in .gitignore, future commits won't include it.

---

## ✅ VERIFICATION CHECKLIST

After completing steps 1-3:

- [ ] New database password generated in Neon
- [ ] All Vercel environment variables set for Production
- [ ] CRON_SECRET generated and added
- [ ] NEXTAUTH_URL points to production domain
- [ ] Local .env.local NOT committed to git
- [ ] Test deployment successful
- [ ] Can log in to production site
- [ ] Database connection works in production

---

## 🚀 DEPLOYMENT STEPS

Once manual actions are complete:

```bash
# 1. Commit the security fixes
git add -A
git commit -m "security: fix critical vulnerabilities - remove PII logging, add CSP headers, fix timing attacks"

# 2. Push to trigger deployment
git push origin main

# 3. Monitor deployment in Vercel dashboard
```

---

## 📞 NEED HELP?

**Database Issues**: 
- Neon Docs: https://neon.tech/docs/introduction
- Check connection pooling settings
- Verify SSL requirements

**Vercel Issues**:
- Vercel Docs: https://vercel.com/docs/environment-variables
- Check build logs for errors
- Verify environment variable names match code

**Security Questions**:
- Review: `SECURITY-FIXES-APPLIED.md`
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Next.js Security: https://nextjs.org/docs/pages/building-your-application/configuring/security-headers

---

## 🎯 QUICK STATUS

**Code Security**: ✅ FIXED  
**Database Credentials**: ⚠️ NEEDS ROTATION  
**Vercel Config**: ⚠️ NEEDS SETUP  
**Ready for Production**: ❌ NO (complete steps 1-3 first)

---

**Estimated Time to Production Ready**: 15-20 minutes
**Priority**: HIGH - Complete before next deployment
