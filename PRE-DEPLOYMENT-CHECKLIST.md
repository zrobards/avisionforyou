# Pre-Deployment Checklist & Requirements

## 📦 What You Need Before Going Live

### 1. **Custom Domain** 🌐
**Status:** ⏳ Not Yet Purchased

**Options:**
- **Option A: Buy Through Vercel** (Easiest)
  - Cost: ~$15-20/year
  - Steps: Vercel Dashboard → Settings → Domains → Buy Domain
  - Auto-configured DNS ✅
  
- **Option B: Use External Registrar** (Namecheap, GoDaddy, etc.)
  - Cost: ~$10-15/year
  - Requires manual DNS configuration
  - Add these records to your registrar:
    ```
    Type: A
    Name: @
    Value: 76.76.21.21
    
    Type: CNAME
    Name: www
    Value: cname.vercel-dns.com
    ```

**Recommended Domain Names:**
- `avisionforyou.org`
- `avisionforyourecovery.org`
- `visionforyourecovery.org`

**After Purchase:**
- [ ] Update `NEXTAUTH_URL` in Vercel to your domain
- [ ] Update Google OAuth redirect URIs
- [ ] Update Square webhook URL
- [ ] Update Resend sender domain

---

### 2. **Google OAuth Credentials** 🔑
**Status:** ⏳ Optional but Highly Recommended

**Why Enable:**
- One-click sign-in for users
- No password to remember
- More secure authentication
- Auto-promotes admin email to ADMIN role

**Setup Steps:**
1. Go to https://console.cloud.google.com
2. Create project: "A Vision For You Recovery"
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google (for testing)
   https://your-domain.com/api/auth/callback/google (for production)
   ```
6. Copy Client ID and Client Secret
7. Add to Vercel environment variables:
   ```
   GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
   ```

---

### 3. **Square Production Credentials** 💳
**Status:** ⚠️ Currently in Sandbox Mode

**Current Settings:**
```
SQUARE_ENVIRONMENT=sandbox
SQUARE_ACCESS_TOKEN=<sandbox-token>
SQUARE_LOCATION_ID=LYQ6AK1QT1R08
```

**Switch to Production:**
1. Log in to https://squareup.com/dashboard
2. Go to Applications → Your App → Production tab
3. Get production credentials:
   - Production Access Token
   - Production Location ID
4. Configure webhook:
   - URL: `https://your-domain.com/api/webhooks/square`
   - Events: `payment.created`, `payment.completed`, `payment.failed`
   - Copy Webhook Signature Key
5. Update Vercel environment variables:
   ```
   SQUARE_ENVIRONMENT=production
   SQUARE_ACCESS_TOKEN=<production-token>
   SQUARE_LOCATION_ID=<production-location-id>
   SQUARE_WEBHOOK_SIGNATURE_KEY=<webhook-key>
   ```

**⚠️ IMPORTANT:** Test with a $1 donation first!

---

### 4. **Resend Email Domain Verification** 📧
**Status:** ✅ API Key Set, ⏳ Domain Not Verified

**Current Setup:**
- Using default Resend sender
- Free tier: 100 emails/day, 3,000/month

**Recommended: Verify Custom Domain**
1. Go to https://resend.com/domains
2. Add your domain
3. Add DNS TXT record to your domain registrar
4. Wait for verification (up to 48 hours)
5. Update environment variable:
   ```
   EMAIL_FROM=newsletter@your-domain.com
   ```

**Upgrade Consideration:**
- With 869+ potential newsletter subscribers
- Paid plan: $20/month for 50,000 emails
- Consider upgrading before first major newsletter send

---

### 5. **Database Migration** 🗄️
**Status:** ⚠️ Must Run in Production

**What It Does:**
- Creates `SocialStats` table
- Allows admin panel to save follower counts permanently

**How to Run:**
```bash
# From your local machine with production DATABASE_URL:
npx prisma migrate deploy
```

**After Migration:**
- [ ] Go to `/admin/social-stats`
- [ ] Enter initial follower counts:
  - Facebook: 869
  - Instagram: 112
  - Twitter: 70
  - LinkedIn: 23
  - TikTok: 41
- [ ] Click Save
- [ ] Verify footer updates instantly

---

### 6. **Vercel Analytics** 📊
**Status:** ✅ Installed and Ready

**What's Included:**
- Page view tracking
- Visitor analytics
- Real-time monitoring
- Automatically enabled on deploy

**No additional setup needed!**

---

## 🔐 Environment Variables Checklist

### ✅ Already Set in Vercel:
- `DATABASE_URL` - Neon PostgreSQL connection
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Site URL (update after domain)
- `ADMIN_EMAIL` - admin@avisionforyourecovery.org
- `RESEND_API_KEY` - Email sending
- `EMAIL_FROM` - Sender email
- `SQUARE_ACCESS_TOKEN` - Payment processing (sandbox)
- `SQUARE_ENVIRONMENT` - Currently "sandbox"
- `SQUARE_LOCATION_ID` - Location ID

### ⏳ Need to Add:
- `GOOGLE_CLIENT_ID` - For Google OAuth (optional)
- `GOOGLE_CLIENT_SECRET` - For Google OAuth (optional)
- `SQUARE_WEBHOOK_SIGNATURE_KEY` - For webhook verification

### ⚠️ Need to Update After Domain:
- `NEXTAUTH_URL` - Change to custom domain

### ⚠️ Need to Update for Production:
- `SQUARE_ENVIRONMENT` - Change to "production"
- `SQUARE_ACCESS_TOKEN` - Update to production token
- `SQUARE_LOCATION_ID` - Update to production location
- `EMAIL_FROM` - Update to verified domain email (optional)

---

## ✅ What's Already Complete

### Features Ready for Production:
- [x] **Social Stats Admin Panel**
  - Database persistence ✅
  - Instant updates across site ✅
  - Dynamic footer with real-time counts ✅
  
- [x] **Newsletter System**
  - HTML email templates ✅
  - Batch sending via Resend ✅
  - Subscriber management ✅
  - Unsubscribe functionality ✅
  
- [x] **Square Donations**
  - One-time, monthly, yearly donations ✅
  - Payment Links API integration ✅
  - Webhook handling ✅
  - Email confirmations ✅
  - Admin dashboard ✅
  - CSV export ✅
  
- [x] **Authentication**
  - Email/password login ✅
  - Google OAuth support (needs credentials) ✅
  - Role-based access ✅
  - Admin auto-promotion ✅
  
- [x] **Vercel Analytics**
  - Package installed ✅
  - Integrated in layout ✅
  - Ready to track on deploy ✅

---

## 🚀 Deployment Steps (In Order)

### Step 1: Purchase Domain
- [ ] Choose domain name
- [ ] Purchase through Vercel or registrar
- [ ] Configure DNS (if external registrar)
- [ ] Wait for DNS propagation (up to 48 hours)

### Step 2: Update Environment Variables
- [ ] Update `NEXTAUTH_URL` to new domain
- [ ] Add Google OAuth credentials (if using)
- [ ] Redeploy on Vercel

### Step 3: Run Database Migration
```bash
npx prisma migrate deploy
```

### Step 4: Initialize Social Stats
- [ ] Visit `/admin/social-stats`
- [ ] Enter follower counts
- [ ] Save and verify footer updates

### Step 5: Configure Production Payments
- [ ] Get Square production credentials
- [ ] Update environment variables
- [ ] Configure webhook
- [ ] Test with $1 donation

### Step 6: Verify Email Setup
- [ ] (Optional) Verify custom domain in Resend
- [ ] Update `EMAIL_FROM` if domain verified
- [ ] Send test newsletter
- [ ] Verify email delivery

### Step 7: Set Up Google OAuth
- [ ] Create Google Cloud project
- [ ] Get OAuth credentials
- [ ] Add to Vercel
- [ ] Test sign-in flow

### Step 8: Final Testing
- [ ] Test all authentication methods
- [ ] Test donation flow (one-time, monthly, yearly)
- [ ] Send test newsletter
- [ ] Update social stats and verify instant updates
- [ ] Check all pages load correctly
- [ ] Verify mobile responsiveness
- [ ] Check SSL certificate (https)
- [ ] Test webhooks with real payment

---

## 📝 Quick Reference URLs

### Development & Deployment:
- **GitHub Repo:** https://github.com/zrobards/avisionforyou
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Current Deployment:** https://avisionforyou.vercel.app

### Third-Party Services:
- **Neon Database:** https://console.neon.tech
- **Resend Dashboard:** https://resend.com/dashboard
- **Square Dashboard:** https://squareup.com/dashboard
- **Google Cloud Console:** https://console.cloud.google.com

### Documentation:
- **Production Deployment Guide:** `/PRODUCTION-DEPLOYMENT-GUIDE.md`
- **Implementation Summary:** `/IMPLEMENTATION-SUMMARY.md`
- **Prisma Schema:** `/prisma/schema.prisma`

---

## 🎯 Ready to Go Live Checklist

Complete these to be 100% production-ready:

- [ ] Custom domain purchased and active
- [ ] SSL certificate issued (automatic with Vercel)
- [ ] All environment variables updated for production
- [ ] Database migration completed
- [ ] Social stats initialized
- [ ] Square switched to production mode
- [ ] Test donation processed successfully
- [ ] Newsletter sent to test subscribers
- [ ] Google OAuth configured (optional)
- [ ] Resend domain verified (optional)
- [ ] All features tested end-to-end
- [ ] No errors in Vercel deployment logs
- [ ] No console errors on website
- [ ] Mobile responsiveness verified
- [ ] Analytics tracking page views

---

## 💰 Cost Breakdown

### One-Time Costs:
- Custom domain: $10-20/year

### Monthly Costs (Free Tier Available):
- **Vercel Hosting:** $0 (Hobby plan sufficient)
- **Neon Database:** $0 (Free tier: 0.5GB storage)
- **Resend Email:** $0 or $20/month
  - Free: 100 emails/day, 3,000/month
  - Paid: 50,000 emails/month
- **Square Processing:** Transaction fees only (2.6% + $0.10)
- **Google OAuth:** Free ✅
- **Vercel Analytics:** Free ✅

**Estimated Monthly: $0-20** (depending on newsletter volume)

---

## 🆘 Getting Help

### Technical Issues:
1. Check deployment logs in Vercel
2. Review browser console for errors
3. Check API endpoint responses
4. Verify environment variables are set
5. Review database connection in Neon

### Service-Specific Support:
- **Vercel:** https://vercel.com/support
- **Square:** https://squareup.com/help
- **Resend:** support@resend.com
- **Neon:** https://neon.tech/docs
- **Google Cloud:** https://cloud.google.com/support

### Emergency Rollback:
1. Go to Vercel → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

---

## 📌 Important Notes

### Security:
- Never commit `.env` files to GitHub
- Keep backup of environment variables in secure location
- Rotate API keys periodically
- Monitor Vercel logs for suspicious activity

### Monitoring:
- Check Square dashboard weekly for donations
- Monitor Resend sending limits
- Review Vercel Analytics for traffic patterns
- Check database size in Neon dashboard

### Maintenance:
- Update social stats monthly or as needed
- Back up database regularly
- Review and respond to contact form submissions
- Monitor newsletter bounce rates
- Test donation flow quarterly

---

## ✨ New Features Implemented Today

### Instant Social Stats Updates:
- ✅ Server-side cache revalidation with `revalidatePath`
- ✅ Client-side event-based updates
- ✅ Footer automatically refreshes when admin updates stats
- ✅ No page reload needed
- ✅ Changes visible immediately across entire site

### Vercel Analytics:
- ✅ Package installed
- ✅ Analytics component added to root layout
- ✅ Automatic page view tracking
- ✅ Real-time visitor monitoring
- ✅ No configuration needed
- ✅ Ready to collect data on first visit after deploy

---

**Last Updated:** January 1, 2026  
**Version:** 2.0  
**Status:** Ready for Domain Purchase & Final Production Setup

**Next Action:** Purchase domain and follow deployment steps above!
