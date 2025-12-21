# ⚡ Quick Deploy to Vercel Production

## Fastest Method - Single Command

Run this command in your terminal:

```bash
npx vercel --prod --yes
```

This will:
- ✅ Build your project
- ✅ Deploy to production
- ✅ Auto-confirm prompts

---

## If First Time - Setup Steps

### 1. Login to Vercel
```bash
npx vercel login
```
(This will open your browser to authenticate)

### 2. Link Project (if needed)
```bash
npx vercel link
```
- Select your account
- Choose existing project or create new
- Name: `seezee` or your project name

### 3. Deploy
```bash
npx vercel --prod
```

---

## 🔐 Before Deploying - Set Environment Variables!

**CRITICAL:** Go to Vercel Dashboard first and set these:

1. Visit: https://vercel.com/dashboard
2. Select your project
3. Go to: **Settings → Environment Variables**
4. Add these for **Production** environment:

```
AUTH_URL=https://see-zee.com
AUTH_SECRET=[Generate new secret: openssl rand -base64 32]
AUTH_GOOGLE_ID=[Your production Google OAuth Client ID]
AUTH_GOOGLE_SECRET=[Your production Google OAuth Client Secret]
DATABASE_URL=[Your production database URL]
NEXT_PUBLIC_APP_URL=https://see-zee.com
NEXT_PUBLIC_DOMAIN=see-zee.com
```

---

## 🚀 Deployment Commands

### Option A: Deploy Now
```bash
npx vercel --prod --yes
```

### Option B: Deploy with Confirmation
```bash
npx vercel --prod
```

### Option C: Deploy via Git (Auto-deploy)
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```
(If GitHub is connected to Vercel, this auto-deploys!)

---

## ✅ After Deployment

1. Visit: https://see-zee.com
2. Test login with Google OAuth
3. Check admin dashboard
4. Verify all routes work

---

## 🆘 Need Help?

- Full guide: `deploy-to-vercel.md`
- Checklist: `PRODUCTION_READINESS_CHECKLIST.md`
- Vercel docs: https://vercel.com/docs









