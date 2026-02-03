# Production Deployment Guide
## A Vision For You Recovery - Complete Setup

Last Updated: January 1, 2026

---

## 📋 Pre-Deployment Checklist

### Required Services & Accounts
- [x] **Vercel Account** - For hosting and deployment
- [ ] **Custom Domain** - Purchase from Vercel or external registrar (Namecheap, GoDaddy, etc.)
- [x] **Neon PostgreSQL Database** - Already configured
- [x] **Resend Account** - For email sending (newsletters, confirmations)
- [ ] **Square Account** - For payment processing
- [ ] **Google Cloud Console** - For Google OAuth (optional but recommended)

---

## 🔐 Environment Variables Setup

### Required for Production

Copy these to your Vercel project settings under **Settings → Environment Variables**:

```bash
# Database (Already configured)
DATABASE_URL="your-neon-postgres-connection-string"

# NextAuth Configuration
NEXTAUTH_URL="https://your-custom-domain.com"
NEXTAUTH_SECRET="<generate-with: openssl rand -base64 32>"

# Admin Configuration
ADMIN_EMAIL="admin@avisionforyourecovery.org"

# Email (Resend API)
RESEND_API_KEY="re_YourResendAPIKey"
EMAIL_FROM="noreply@avisionforyou.org"

# Square Payments (PRODUCTION - Switch from sandbox)
SQUARE_ACCESS_TOKEN="your-production-access-token"
SQUARE_ENVIRONMENT="production"
SQUARE_LOCATION_ID="your-production-location-id"
SQUARE_WEBHOOK_SIGNATURE_KEY="your-webhook-signature-key"

# Google OAuth (Optional but recommended)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

---

## 🏦 Square Payment Setup (Production)

### Current Status: **Sandbox Mode** ✅
### Production Steps:

1. **Switch to Production Account**
   - Log in to https://squareup.com/dashboard
   - Navigate to **Apps → Manage Applications**
   - Select your application
   - Switch to **Production** tab

2. **Get Production Credentials**
   ```
   Production Access Token: Applications → Your App → Production → Credentials
   Production Location ID: Locations → Main Location → Copy ID
   ```

3. **Configure Webhooks**
   - Go to **Webhooks** in Square Dashboard
   - Add endpoint: `https://your-domain.com/api/webhooks/square`
   - Subscribe to events:
     - `payment.created`
     - `payment.completed`
     - `payment.failed`
   - Copy **Webhook Signature Key**

4. **Update Vercel Environment Variables**
   ```bash
   SQUARE_ENVIRONMENT=production
   SQUARE_ACCESS_TOKEN=<production-token>
   SQUARE_LOCATION_ID=<production-location-id>
   SQUARE_WEBHOOK_SIGNATURE_KEY=<webhook-key>
   ```

5. **Test with Real Payment**
   - Use real credit card (will process actual payment)
   - Verify webhook receives events
   - Check admin dashboard for donation record

**⚠️ Important:** Test with small amount ($1) first!

---

## 📧 Email Setup (Resend)

### Current Limits:
- **Free Tier**: 100 emails/day, 3,000/month
- **Paid Plans**: Start at $20/month for 50,000 emails

### Setup Steps:

1. **Verify Your Domain** (Recommended for production)
   - Go to https://resend.com/domains
   - Add your custom domain
   - Add DNS records to your domain registrar:
     ```
     Type: TXT
     Name: @
     Value: <verification-code-from-resend>
     ```
   - Wait for verification (up to 48 hours)

2. **Get API Key**
   - Navigate to https://resend.com/api-keys
   - Create new API key
   - Add to Vercel: `RESEND_API_KEY=re_...`

3. **Configure Sender Email**
   - After domain verification, update:
   ```bash
   EMAIL_FROM="newsletter@avisionforyou.org"
   ```

### Newsletter Sending
- **Current Implementation**: Sends to all subscribers via Resend
- **Features**:
  - HTML email templates with branding
  - Batch sending (100 emails per batch)
  - Automatic unsubscribe links
  - Error handling and retry logic
  - Tracks sent count and failures

**Note:** With 869+ Facebook followers, consider upgrading to paid plan for newsletter capacity.

---

## 🔑 Google OAuth Setup

### Why Enable Google OAuth?
- One-click sign-in for users
- No password management needed
- Secure authentication via Google
- Auto-promotes admin email to ADMIN role

### Setup Steps:

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Create new project: "A Vision For You Recovery"
   - Enable **Google+ API**

2. **Create OAuth 2.0 Credentials**
   - Navigate to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: "A Vision For You Website"

3. **Configure Authorized Redirect URIs**
   ```
   For Production:
   https://your-domain.com/api/auth/callback/google
   
   For Development:
   http://localhost:3000/api/auth/callback/google
   ```

4. **Get Credentials**
   - Copy **Client ID** and **Client Secret**
   - Add to Vercel environment variables:
   ```bash
   GOOGLE_CLIENT_ID="123456789-abc...apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-abc123..."
   ```

5. **Test Sign In**
   - Go to `/login`
   - Click "Sign in with Google"
   - Verify login works
   - If email matches `ADMIN_EMAIL`, user gets ADMIN role automatically

---

## 🌐 Custom Domain Setup

### Option 1: Purchase Through Vercel
1. Go to your Vercel project
2. Navigate to **Settings → Domains**
3. Click **Buy a domain**
4. Search for available domains
5. Complete purchase (typically $15-20/year)
6. DNS configured automatically ✅

### Option 2: Use External Domain (Namecheap, GoDaddy, etc.)
1. Purchase domain from registrar
2. In Vercel: **Settings → Domains → Add**
3. Enter your domain: `avisionforyou.org`
4. Follow Vercel instructions to add DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
5. Wait for DNS propagation (up to 48 hours)

### After Domain is Active:
1. Update `NEXTAUTH_URL` in Vercel:
   ```bash
   NEXTAUTH_URL="https://avisionforyou.org"
   ```
2. Update Google OAuth redirect URIs
3. Update Square webhook URL
4. Update Resend sender domain
5. Redeploy application

---

## 🗄️ Database Migration

### Run Database Migrations

**Important:** Run this after deploying to production:

```bash
# From your local machine:
npx prisma migrate deploy

# This will:
# - Create SocialStats table
# - Update existing tables
# - Apply all pending migrations
```

### Seed Initial Social Stats

After migration, go to `/admin/social-stats` and enter initial follower counts:
- Facebook: 869
- Instagram: 112
- Twitter: 70
- LinkedIn: 23
- TikTok: 41

---

## ✅ Post-Deployment Testing

### Critical Features to Test:

1. **Authentication**
   - [ ] Email/password login
   - [ ] Google OAuth login
   - [ ] Admin role assignment
   - [ ] Session persistence

2. **Donations (Square)**
   - [ ] One-time donation ($5 test)
   - [ ] Monthly recurring donation
   - [ ] Yearly recurring donation
   - [ ] Webhook updates status
   - [ ] Email confirmation sent
   - [ ] Admin dashboard shows donation
   - [ ] CSV export works

3. **Newsletter**
   - [ ] Create draft newsletter
   - [ ] Add subscribers via `/newsletter` page
   - [ ] Send newsletter to subscribers
   - [ ] Verify emails received
   - [ ] Check sent count in admin
   - [ ] Test unsubscribe link

4. **Social Stats**
   - [ ] Update follower counts in `/admin/social-stats`
   - [ ] Verify footer displays new counts
   - [ ] Check `/social` page updates
   - [ ] Confirm database persistence

5. **General**
   - [ ] All pages load correctly
   - [ ] Images display properly
   - [ ] Forms submit successfully
   - [ ] Mobile responsive design
   - [ ] SSL certificate active (https)

---

## 🚨 Common Issues & Solutions

### Issue: "Environment variable not found: DATABASE_URL"
**Solution:** Ensure DATABASE_URL is set in Vercel environment variables and redeploy.

### Issue: Square payments fail with "location_id required"
**Solution:** Set `SQUARE_LOCATION_ID` environment variable and redeploy.

### Issue: Newsletter emails not sending
**Solution:** 
1. Verify `RESEND_API_KEY` is set correctly
2. Check Resend dashboard for sending limits
3. Verify sender email is verified in Resend

### Issue: Google OAuth shows "redirect_uri_mismatch"
**Solution:** 
1. Check Google Cloud Console authorized redirect URIs
2. Ensure URI exactly matches: `https://your-domain.com/api/auth/callback/google`
3. No trailing slashes

### Issue: Social stats not updating in footer
**Solution:**
1. Run database migration: `npx prisma migrate deploy`
2. Check browser console for API errors
3. Verify `/api/public/social-stats` returns data

---

## 📊 Monitoring & Maintenance

### Vercel Analytics
- Enable in project settings for traffic insights
- Monitor function execution times
- Track error rates

### Database Monitoring
- Check Neon dashboard for connection limits
- Monitor database size
- Set up automatic backups

### Email Monitoring
- Track Resend sending limits
- Monitor bounce rates
- Check spam reports

### Square Dashboard
- Review transaction history daily
- Check for failed payments
- Monitor webhook delivery success

---

## 🔄 Deployment Workflow

### Automatic Deployment (Current Setup)
1. Push code to `main` branch on GitHub
2. Vercel automatically detects changes
3. Builds and deploys new version
4. Live in ~2-3 minutes

### Manual Deployment
1. Go to Vercel dashboard
2. Select your project
3. Click **Deployments** tab
4. Click **Redeploy** on latest deployment

---

## 📞 Support Contacts

### Technical Issues:
- **Vercel Support**: https://vercel.com/support
- **Square Support**: https://squareup.com/help
- **Resend Support**: support@resend.com
- **Neon Support**: https://neon.tech/docs

### Domain Issues:
- Check with your domain registrar support

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ Custom domain loads the website  
✅ Users can sign up and log in  
✅ Google OAuth works for quick sign-in  
✅ Donations process successfully via Square  
✅ Webhooks update donation status in real-time  
✅ Newsletter sends to all subscribers via Resend  
✅ Social stats update dynamically in admin panel  
✅ Footer displays live follower counts  
✅ All environment variables are set correctly  
✅ SSL certificate is active (https)  
✅ No errors in browser console or Vercel logs  

---

## 🚀 Ready to Go Live?

Follow this checklist:

1. ✅ All environment variables set in Vercel
2. ✅ Custom domain purchased and configured
3. ✅ Square switched to production mode
4. ✅ Resend domain verified
5. ✅ Google OAuth configured
6. ✅ Database migrations applied
7. ✅ All features tested
8. ✅ Admin account created and tested
9. ✅ Initial social stats populated
10. ✅ Test donation completed successfully

**Once complete, you're live!** 🎉

---

## 📝 Notes

- Keep a backup of all environment variables in a secure location
- Document any custom changes made to the codebase
- Schedule regular database backups
- Monitor email sending limits to avoid service interruption
- Review donation transactions weekly
- Update social stats monthly or as needed

---

## 🆘 Emergency Contacts

If critical issues arise:
1. Check Vercel deployment logs first
2. Review error messages in browser console
3. Check Vercel Functions logs for API errors
4. Verify all environment variables are set
5. Test database connection in Neon dashboard

For immediate rollback:
1. Go to Vercel → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

---

**End of Production Deployment Guide**

Generated: January 1, 2026  
Version: 1.0  
Maintained by: Development Team
