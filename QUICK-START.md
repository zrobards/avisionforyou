# 🚀 QUICK START - Donations Setup (15 Minutes)

## What You Just Got
✅ One-time donations
✅ Monthly recurring donations
✅ Yearly recurring donations
✅ Customer donation management
✅ Admin tracking with CSV export
✅ Real-time webhook updates

## Do This RIGHT NOW (In Order)

### Step 1: Get Webhook Signing Key (2 min)
```
1. Go to https://developer.squareup.com/apps
2. Click your app
3. Click "Webhooks" on the left
4. Find "Signing key" section
5. Click "Show"
6. COPY the entire key (looks like: whsec_...)
```

### Step 2: Add to Vercel (2 min)
```
1. Go to https://vercel.com
2. Find your project "avisionforyou"
3. Click "Settings"
4. Click "Environment Variables"
5. Click "Add New"
6. Name: SQUARE_WEBHOOK_SIGNATURE_KEY
7. Value: [PASTE the key from Step 1]
8. Click "Save"
9. WAIT 30 SECONDS for automatic redeploy
```

### Step 3: Register Webhook in Square (3 min)
```
1. Go back to Square Webhooks page
2. Click "Add Endpoint"
3. Endpoint URL: https://avisionforyou.vercel.app/api/webhooks/square
4. Click "Add"
5. Check these boxes:
   ☑️ payment.created
   ☑️ payment.completed ⭐
   ☑️ invoice.payment_received ⭐
   ☑️ subscription.created
   ☑️ subscription.updated
   ☑️ subscription.deleted
6. Click "Update"
```

### Step 4: Test (5 min)
```
1. On webhook page, click "Send Test Event"
2. Select: payment.completed
3. Click "Send"
4. Should see green checkmark ✅
```

### Step 5: Test Real Donation (3 min)
```
1. Go to: https://avisionforyou.vercel.app/donate
2. Amount: $5
3. Frequency: One-Time
4. Name: Test Donor
5. Email: your-email@gmail.com
6. Click "Donate Now"
7. Card: 4532 0151 1283 0366
8. Exp: 12/26
9. CVV: 123
10. Pay
```

### Step 6: Check Admin Dashboard (1 min)
```
1. Go to: https://avisionforyou.vercel.app/admin/donations
2. Should see your test donation
3. Status should say COMPLETED ✅
4. If not there, wait 10 seconds and refresh
```

## That's It! 🎉

Your donations system is NOW WORKING.

---

## Customers Can Now:
✅ Donate at `/donate`
✅ Choose one-time, monthly, or yearly
✅ View donations at `/dashboard/donations` (after login)
✅ Cancel recurring anytime

## You (Admin) Can Now:
✅ Track all donations at `/admin/donations`
✅ See real-time updates (via webhooks)
✅ Export donations as CSV
✅ Monitor recurring revenue

---

## Before Going LIVE to Real Donors:

1. **Test monthly donation:**
   - Choose MONTHLY frequency
   - Verify "Next Renewal" date appears (should be ~30 days out)

2. **Test cancellation:**
   - Login somewhere
   - Go to `/dashboard/donations`
   - Cancel a recurring donation
   - Verify it changes to CANCELLED

3. **Get production credentials:**
   - When ready for real money, repeat steps 1-3 with production Square credentials
   - Update same Vercel variables with production keys

---

## Having Issues?

### Donation doesn't appear in admin dashboard:
- Wait 15 seconds
- Refresh browser
- Check Vercel logs: https://vercel.com → Projects → avisionforyou → Deployments

### "Invalid Signature" error:
- Copy webhook key VERY carefully again (no extra spaces)
- Add to Vercel again
- Wait 30 seconds for redeploy
- Test webhook again

### Test card doesn't work:
- Use exactly: `4532 0151 1283 0366`
- Exp: `12/26` (any future date)
- CVV: `123` (any 3 digits)

---

## Files Reference:
- **WEBHOOK-CONFIG-WALKTHROUGH.md** - Detailed step-by-step
- **SETUP-CHECKLIST.md** - Complete checklist
- **DONATIONS-COMPLETE.md** - Full technical documentation
- **WEBHOOK-SETUP.md** - Webhook details

---

## You're Done! 🎊

Donations are live. Share the `/donate` link with your community.

Questions? Check the detailed guides above.
