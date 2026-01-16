# Complete Donation Setup - Final Checklist

## ✅ Phase 1: Code & Database (DONE)
- [x] Recurring donations code implemented
- [x] Webhook handler created
- [x] Customer dashboard built
- [x] Code deployed to Vercel
- [x] Database migration file created

## 🔄 Phase 2: Database Migration (YOU ARE HERE)

### Do This NOW:
```bash
cd "/Users/zacharyrobards/Documents/A vision for you recovery full website mockup/avisionforyou"
npx prisma migrate deploy
```

**What this does:**
- Creates new fields in donations table (subscriptionId, nextRenewalDate, etc.)
- Creates webhook_logs table for tracking
- Ready for production use

**Status:** ⏳ Needs to be run in Vercel environment

---

## 📋 Phase 3: Square Webhook Setup (NEXT)

### Follow this guide (READ CAREFULLY):
📖 **WEBHOOK-CONFIG-WALKTHROUGH.md** - Step-by-step instructions

### Quick Steps:
1. **Get Signing Key** (2 minutes)
   - Square Dashboard → Webhooks → Copy signing key
   
2. **Add to Vercel** (2 minutes)
   - Vercel → Settings → Environment Variables
   - Add: `SQUARE_WEBHOOK_SIGNATURE_KEY`
   
3. **Register Endpoint** (3 minutes)
   - Square Dashboard → Webhooks → Add Endpoint
   - URL: `https://avisionforyou.vercel.app/api/webhooks/square`
   - Enable all listed events
   
4. **Test** (5 minutes)
   - Send test webhook from Square
   - Should get green checkmark ✅

---

## ✨ Phase 4: Functional Testing

### Test One-Time Donation
- [ ] Visit `/donate`
- [ ] Select $50, One-Time
- [ ] Enter name & email
- [ ] Click "Donate Now"
- [ ] Use card: `4532 0151 1283 0366`
- [ ] Payment completes
- [ ] Check `/admin/donations` - appears within 5 seconds
- [ ] Status shows COMPLETED ✅

### Test Monthly Donation
- [ ] Visit `/donate`
- [ ] Select $20, **MONTHLY** ⭐
- [ ] Complete payment with test card
- [ ] Check `/admin/donations`
- [ ] Verify "Next Renewal" shows ~30 days from now
- [ ] Status shows COMPLETED ✅

### Test Yearly Donation
- [ ] Visit `/donate`
- [ ] Select $100, **YEARLY** ⭐
- [ ] Complete payment with test card
- [ ] Check `/admin/donations`
- [ ] Verify "Next Renewal" shows ~1 year from now
- [ ] Status shows COMPLETED ✅

### Test Customer Dashboard
- [ ] Login at `/login` (use your email/password)
- [ ] Visit `/dashboard/donations`
- [ ] See all test donations listed
- [ ] Can see frequency and next renewal date
- [ ] Click "Cancel Recurring Donation" on monthly one
- [ ] Confirms it cancels
- [ ] Status changes to CANCELLED

### Test CSV Export
- [ ] Go to `/admin/donations`
- [ ] Click "Download CSV" button
- [ ] File downloads with donations
- [ ] Contains all columns (date, name, amount, frequency, status, etc.)

### Test Emails
- [ ] Check email for confirmation after each donation
- [ ] Should contain donation details and ID
- [ ] Should mention next renewal date for recurring

---

## 🎯 Phase 5: Before Going Live

### Switch to Production (when ready)
1. **Get Production Credentials from Square:**
   - Go to https://developer.squareup.com/apps
   - Select your app
   - Click **Credentials**
   - Copy production **Access Token**
   - Get production **Webhook Signing Key**

2. **Update Vercel Variables:**
   - `SQUARE_ACCESS_TOKEN` → production token
   - `SQUARE_ENVIRONMENT` → `production`
   - `SQUARE_WEBHOOK_SIGNATURE_KEY` → production key

3. **Register Production Webhook:**
   - Repeat Phase 3 with production credentials
   - Use same endpoint URL

4. **Remove Test Labels:**
   - Edit `/src/app/donate/page.tsx`
   - Remove "Sandbox Test" label
   - Change "Square (Sandbox Test)" to "Square"

5. **Test with Real Card:**
   - Use actual card to test (don't worry, you can refund)
   - Verify it works end-to-end
   - Refund through Square Dashboard if needed

---

## 📊 Phase 6: Monitor & Maintain

### Daily
- [ ] Check `/admin/donations` - new donations appearing?
- [ ] Verify webhook events are being processed
- [ ] Check Vercel logs for any errors

### Weekly
- [ ] Review donation totals
- [ ] Confirm monthly recurring donations processed
- [ ] Check for any failed donations

### Monthly
- [ ] Export CSV for accounting
- [ ] Review donor feedback
- [ ] Check webhook success rate

### Quarterly
- [ ] Review total recurring revenue
- [ ] Analyze donation patterns
- [ ] Plan campaigns based on donor base

---

## 🚀 Final Launch Checklist

### Configuration Complete
- [ ] Database migration deployed (`prisma migrate deploy`)
- [ ] Webhook signing key in Vercel
- [ ] Webhook endpoint registered in Square
- [ ] All events enabled and tested
- [ ] Production credentials ready (if going live)

### Functionality Verified
- [ ] One-time donations work
- [ ] Monthly donations work
- [ ] Yearly donations work
- [ ] Webhooks update status in real-time
- [ ] Customer dashboard shows donations
- [ ] Customer can cancel recurring
- [ ] CSV export works
- [ ] Confirmation emails send

### Ready for Promotion
- [ ] Share `/donate` link with community
- [ ] Add donation button to website
- [ ] Social media posts about donation program
- [ ] Email supporters about recurring option
- [ ] Create recurring donor tier/recognition

---

## 📞 Support & Troubleshooting

### If Something Breaks
1. **Check Vercel Logs:**
   - https://vercel.com → Projects → avisionforyou → Deployments → Logs
   
2. **Check Webhook Logs:**
   - Square Dashboard → Webhooks → Your Endpoint → Event History
   
3. **Restart Webhook:**
   - Disable and re-enable webhook endpoint
   - Re-register if needed
   
4. **Test Manually:**
   - Use Square test card to debug
   - Check admin dashboard updates
   - Monitor email delivery

### Common Issues & Fixes

**Donations not appearing in dashboard:**
- Wait 15 seconds and refresh
- Check Vercel logs for errors
- Verify webhook is enabled
- Send test webhook from Square

**Invalid Signature Error:**
- Copy webhook key again carefully
- Delete old key from Vercel
- Add new one
- Wait for redeploy

**Test card doesn't work:**
- Use: `4532 0151 1283 0366`
- Exp: 12/26 (any future date)
- CVV: 123 (any 3 digits)
- If still fails, check Square account is in good standing

---

## 📝 Important Dates

- Today: Setup webhooks & test
- Tomorrow: Go live with donations
- End of month: First CSV export
- End of quarter: First recurring payment batch

---

## 🎉 You're Ready!

Once you've completed all phases above, your donation system is:
✅ Fully functional
✅ Real-time tracking
✅ Recurring support
✅ Production-ready
✅ Customer-managed
✅ Admin-tracked
✅ Documented

**Next step: Follow WEBHOOK-CONFIG-WALKTHROUGH.md**

Questions? Check the other guides:
- DONATIONS-COMPLETE.md
- WEBHOOK-SETUP.md
- SQUARE-SETUP.md
