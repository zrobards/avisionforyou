# Square Webhook Configuration - Step-by-Step Guide

## Step 1: Get Your Webhook Signing Key

This is the security key that proves webhooks are actually from Square.

### 1A. Open Square Developer Dashboard
1. Go to https://developer.squareup.com/apps
2. Sign in with your Square account
3. Look for your app (or create one named "A Vision For You Recovery")

### 1B. Get the Signing Key
1. In the left sidebar, click **Webhooks**
2. You'll see a section labeled "**Signing key**"
3. Click **Show** next to the signing key
4. **Copy the entire key** (it looks like: `whsec_...`)
5. **KEEP THIS SAFE** - Don't share this key

### 1C. Add to Vercel Environment Variables
1. Go to https://vercel.com and sign in
2. Find your project (avisionforyou)
3. Click **Settings** at the top
4. Click **Environment Variables** in the left sidebar
5. Click **Add New** button
6. Fill in:
   - **Name:** `SQUARE_WEBHOOK_SIGNATURE_KEY`
   - **Value:** [Paste the key you copied from Square]
   - **Environments:** Select all (Production, Preview, Development)
7. Click **Save**
8. **Wait 30 seconds** - Vercel will automatically redeploy with the new key

---

## Step 2: Register Your Webhook Endpoint

This tells Square where to send webhook notifications.

### 2A. Go to Webhooks Settings
1. Back in Square Developer Dashboard
2. Make sure you're on the **Webhooks** page
3. Click **Add Endpoint** button

### 2B. Enter Your Webhook URL
1. In the "**Endpoint URL**" field, enter:
   ```
   https://avisionforyou.vercel.app/api/webhooks/square
   ```
   
   **Replace `avisionforyou`** with your actual Vercel domain if different
   
   (You can find your Vercel URL in your project dashboard)

2. Click **Add Endpoint**

### 2C. Enable Webhook Events
After adding the endpoint, you'll see a list of events. Enable these:

**Payment Events:**
- ☑️ `payment.created` - New payment initiated
- ☑️ `payment.completed` - Payment successful ⭐ **IMPORTANT**
- ☑️ `payment.updated` - Payment status changed

**Invoice Events (for recurring):**
- ☑️ `invoice.payment_pending` - Invoice awaiting payment
- ☑️ `invoice.payment_received` - Invoice paid ⭐ **IMPORTANT**

**Subscription Events:**
- ☑️ `subscription.created` - Recurring started
- ☑️ `subscription.updated` - Details changed
- ☑️ `subscription.deleted` - Subscription cancelled

---

## Step 3: Test the Webhook

Let's verify everything is working.

### 3A. Send a Test Event
1. Still in the Webhooks page, find your endpoint
2. Click the **Send Test Event** button
3. Select event type: `payment.completed`
4. Click **Send**

### 3B. Check for Success
You should see:
- ✅ Status: **200** (green checkmark)
- ✅ Timestamp of when it was sent

If you see a red X or error:
- Go back to Step 1C - verify the signing key is correct in Vercel
- Make sure your Vercel URL is exactly correct
- Check Vercel logs: https://vercel.com/projects/[project]/deployments

---

## Step 4: Verify Everything Works

### 4A. Test a Real Donation
1. Go to: https://avisionforyou.vercel.app/donate
2. Enter test info:
   - Amount: $5
   - Frequency: One-Time
   - Name: Test Donor
   - Email: your-email@gmail.com
3. Click "Donate Now"
4. On the Square form, use test card:
   - Card number: `4532 0151 1283 0366`
   - Exp: Any future date (e.g., 12/26)
   - CVV: Any 3 digits (e.g., 123)
5. Click **Pay**

### 4B. Check Admin Dashboard
1. Go to: https://avisionforyou.vercel.app/admin/donations
2. You should see your test donation appear **within a few seconds**
3. Status should show: **COMPLETED** (green)

If it doesn't appear:
- Wait 10-15 seconds (sometimes takes a moment)
- Refresh the page
- Check browser console for errors (F12 → Console tab)

### 4C. Check Logs
1. Vercel Dashboard → Deployments → Function Logs
2. You should see webhook processing logs if everything worked

---

## Step 5: Test Monthly Donation

### 5A. Create a Monthly Donation
1. Go to: https://avisionforyou.vercel.app/donate
2. Amount: $20
3. **Frequency: MONTHLY** ⭐ Important
4. Name & Email
5. Click "Donate Now"
6. Use test card: `4532 0151 1283 0366`

### 5B. Verify Next Renewal Date
1. Go to: https://avisionforyou.vercel.app/admin/donations
2. Find your monthly donation
3. You should see a "Next Renewal" date showing one month from today

---

## Complete Checklist

Before launching to real donors:

### Configuration
- [ ] Got webhook signing key from Square
- [ ] Added `SQUARE_WEBHOOK_SIGNATURE_KEY` to Vercel
- [ ] Waited 30 seconds for Vercel redeploy
- [ ] Registered webhook endpoint in Square
- [ ] Enabled all required events
- [ ] Test event successful (green checkmark)

### Testing
- [ ] Test one-time donation works
- [ ] Donation appears in admin dashboard within seconds
- [ ] Status shows COMPLETED
- [ ] Test monthly donation works
- [ ] Next renewal date shows correctly
- [ ] Confirmation email received

### Optional but Recommended
- [ ] Test cancellation at `/dashboard/donations`
- [ ] Test CSV export from `/admin/donations`
- [ ] Share dashboard link with team for testing

---

## Troubleshooting

### ❌ "Invalid Signature" Error
**Solution:**
1. Copy the signing key again from Square (make sure you got the full key)
2. Delete the old one from Vercel
3. Add it again with exact copy/paste
4. Wait 30 seconds for redeploy
5. Test webhook again

### ❌ Webhook Returns 404 Error
**Solution:**
1. Check your Vercel domain name
2. Make sure URL is exactly: `https://[your-domain]/api/webhooks/square`
3. Verify you didn't add a trailing slash
4. Check Vercel URL is correct in Webhooks settings

### ❌ Donation doesn't appear after payment
**Solution:**
1. Wait 15 seconds and refresh
2. Check Vercel logs for errors
3. Verify webhook endpoint is enabled in Square
4. Test webhook manually (should get green checkmark)

### ❌ No confirmation email received
**Solution:**
1. Check spam folder
2. Verify `RESEND_API_KEY` is set in Vercel
3. Verify `ADMIN_EMAIL` is set in Vercel
4. Check Vercel logs for email errors

---

## After Webhooks Are Working

You still need to:

### 1. Run Database Migration (if not done yet)
```bash
npx prisma migrate deploy
```

### 2. Test With Real Card (optional, for production)
Before launching to real donors, you can test with a real card:
1. The payment will go through
2. You can then refund it in Square Dashboard
3. This verifies everything works with real cards

### 3. Switch to Production (when ready)
When you want to accept real donations:
1. Get your PRODUCTION Square credentials
2. Update environment variables in Vercel:
   - `SQUARE_ACCESS_TOKEN` → production token
   - `SQUARE_ENVIRONMENT` → `production`
   - `SQUARE_WEBHOOK_SIGNATURE_KEY` → production signing key

3. Register webhook again with production key
4. Remove "(Sandbox Test)" from donation form labels
5. Test with real card to verify

---

## You're Almost There! 🎉

Once webhooks are configured and tested:
✅ Donations are **fully functional**
✅ Real-time tracking **works**
✅ Customers can donate and **see their status immediately**
✅ Admin can **export donations as CSV**
✅ Recurring donations **auto-renew** with Square webhooks

That's it! Your donation system is complete and ready to launch.

Need help? Check the full guides:
- DONATIONS-COMPLETE.md
- WEBHOOK-SETUP.md
- SQUARE-SETUP.md
