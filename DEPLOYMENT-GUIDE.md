# Deployment Guide: GitHub → Vercel

## ✅ Step 1: Git Repository Created
Your local git repository has been initialized with all files committed!

**Commit Details:**
- 248 files committed
- Initial commit message: "Initial commit: A Vision For You Recovery Platform"
- All source code, database migrations, and configuration files included

---

## 🚀 Step 2: Push to GitHub

### Option A: Create New Repository on GitHub (Recommended)

1. **Go to GitHub and create a new repository:**
   - Visit: https://github.com/new
   - Repository name: `avfy-recovery-platform` (or your preferred name)
   - Description: "A Vision For You - Recovery & Support Platform"
   - **Keep it PRIVATE** (contains sensitive configuration)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)

2. **Push your code to GitHub:**
   ```bash
   cd /Users/zacharyrobards/Downloads/avfy-main
   
   # Add your GitHub repository as remote
   git remote add origin https://github.com/YOUR_USERNAME/avfy-recovery-platform.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

### Option B: Use Existing GitHub Repository

If you already have a repository:
```bash
cd /Users/zacharyrobards/Downloads/avfy-main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 3: Deploy to Vercel

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel:**
   - Visit: https://vercel.com/new
   - Sign in with your GitHub account

2. **Import Your Repository:**
   - Click "Import Project"
   - Select your GitHub repository (`avfy-recovery-platform`)
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

4. **Add Environment Variables:**
   Click "Environment Variables" and add the following:

   **Required:**
   ```
   DATABASE_URL=your_postgresql_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

   **Email (Resend):**
   ```
   RESEND_API_KEY=your_resend_api_key
   FROM_EMAIL=noreply@yourdomain.com
   ```

   **Square Payment:**
   ```
   SQUARE_ACCESS_TOKEN=your_square_access_token
   SQUARE_LOCATION_ID=your_square_location_id
   SQUARE_ENVIRONMENT=sandbox
   SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key
   NEXT_PUBLIC_SQUARE_ENVIRONMENT=sandbox
   ```

   **Optional (Google OAuth):**
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

   **Encryption:**
   ```
   ENCRYPTION_KEY=your_32_character_encryption_key
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (usually 2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd /Users/zacharyrobards/Downloads/avfy-main
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name? (avfy-recovery-platform)
# - Link to existing project? No
# - Deploy to production? Yes

# Add environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
# ... (add all required env vars)

# Redeploy with env vars
vercel --prod
```

---

## ⚙️ Step 4: Post-Deployment Configuration

### 1. Database Setup
```bash
# Run migrations on production database
npx prisma migrate deploy

# Seed initial data
npx prisma db seed
```

### 2. Setup Admin Account
- Visit: `https://your-app.vercel.app/setup-admin`
- Create your first admin account

### 3. Configure Square Webhooks
- Go to: Square Dashboard → Webhooks
- Add endpoint: `https://your-app.vercel.app/api/webhooks/square`
- Subscribe to events:
  - `payment.created`
  - `payment.completed`
  - `payment.updated`
  - `subscription.created`
  - `subscription.updated`
  - `subscription.deleted`

### 4. Configure Domain (Optional)
- In Vercel Dashboard → Settings → Domains
- Add your custom domain: `avisionforyourecovery.org`
- Update DNS records as instructed
- Update `NEXTAUTH_URL` environment variable

---

## 📋 Required Environment Variables Checklist

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Random 32+ character string
- [ ] `NEXTAUTH_URL` - Your Vercel app URL
- [ ] `RESEND_API_KEY` - From Resend dashboard
- [ ] `FROM_EMAIL` - Your verified sending email
- [ ] `SQUARE_ACCESS_TOKEN` - From Square dashboard
- [ ] `SQUARE_LOCATION_ID` - From Square dashboard
- [ ] `SQUARE_ENVIRONMENT` - "sandbox" or "production"
- [ ] `SQUARE_WEBHOOK_SIGNATURE_KEY` - From Square webhooks
- [ ] `ENCRYPTION_KEY` - Random 32 character string

### Generate Required Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY (exactly 32 characters)
openssl rand -hex 16
```

---

## 🔒 Security Checklist

- [ ] All environment variables are set in Vercel
- [ ] Database is configured with SSL
- [ ] `.env` file is in `.gitignore` (already done)
- [ ] Square is in sandbox mode until ready for production
- [ ] Admin account created with strong password
- [ ] Webhook signature verification enabled
- [ ] Custom domain SSL certificate active

---

## 🚨 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify PostgreSQL database is accessible

### Database Connection Issues
- Confirm `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- Enable SSL in connection string: `?sslmode=require`

### Webhook Issues
- Verify `SQUARE_WEBHOOK_SIGNATURE_KEY` is correct
- Check webhook endpoint is publicly accessible
- Review webhook logs in Square dashboard

---

## 📞 Support

Need help? Check the documentation:
- `PRODUCTION-DEPLOYMENT-GUIDE.md`
- `PRE-DEPLOYMENT-CHECKLIST.md`
- `SETUP-CHECKLIST.md`

---

**Your AVFY platform is ready to deploy! 🎉**
