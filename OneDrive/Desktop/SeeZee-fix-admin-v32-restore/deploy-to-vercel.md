# 🚀 Deploy to Vercel Production - Quick Guide

## Option 1: Deploy via Vercel CLI (Recommended)

### Step 1: Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Link your project (if first time)
```bash
vercel link
```
Follow the prompts:
- Set up and develop? **Y**
- Which scope? (Select your account)
- Link to existing project? **Y** (or **N** to create new)
- Project name: (Use your project name)

### Step 4: Deploy to Production
```bash
vercel --prod
```

Or use the alias:
```bash
vercel -p
```

---

## Option 2: Deploy via Git Push (Automatic)

If your project is connected to GitHub and Vercel:

### Step 1: Check git status
```bash
git status
```

### Step 2: Add and commit changes
```bash
git add .
git commit -m "Production deployment"
```

### Step 3: Push to main branch
```bash
git push origin main
```

Vercel will automatically deploy when you push to the main branch!

---

## Option 3: Deploy via Vercel Dashboard (Web Interface)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (or click "New Project" to import)
3. Go to "Deployments" tab
4. Click "Create Deployment" or "Redeploy"
5. Select branch: `main` or `master`
6. Click "Deploy"

---

## 🔐 Environment Variables Setup (CRITICAL)

Before deploying, ensure these are set in Vercel Dashboard:

1. Go to **Project Settings → Environment Variables**
2. Add these variables for **Production** environment:

```
AUTH_URL=https://see-zee.com
AUTH_SECRET=[Your production secret - generate new one!]
AUTH_GOOGLE_ID=[Production Google OAuth Client ID]
AUTH_GOOGLE_SECRET=[Production Google OAuth Client Secret]
DATABASE_URL=[Production database connection string]
NEXT_PUBLIC_APP_URL=https://see-zee.com
NEXT_PUBLIC_DOMAIN=see-zee.com
```

**⚠️ IMPORTANT:**
- Generate a NEW `AUTH_SECRET` for production (don't use dev secret)
- Use PRODUCTION Google OAuth credentials (not dev)
- Ensure production database is configured

---

## 📋 Quick Deployment Command

Run this single command to deploy:

```bash
npx vercel --prod --yes
```

The `--yes` flag auto-confirms prompts, and `--prod` deploys to production.

---

## ✅ Post-Deployment Checklist

After deployment:

1. ✅ Visit your production URL: `https://see-zee.com`
2. ✅ Test Google OAuth login
3. ✅ Verify protected routes work
4. ✅ Check admin dashboard access
5. ✅ Test database connections
6. ✅ Review deployment logs in Vercel dashboard

---

## 🆘 Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Run `npm run build` locally first

**Environment variables not working?**
- Make sure they're set for "Production" environment
- Redeploy after adding new variables

**OAuth not working?**
- Verify Google OAuth production client is configured
- Check redirect URIs in Google Cloud Console
- Ensure `AUTH_URL` matches your domain

---

## 📞 Need Help?

- Vercel Docs: https://vercel.com/docs
- Project deployment guide: `docs/production-deployment-guide.md`
- Production checklist: `PRODUCTION_READINESS_CHECKLIST.md`









