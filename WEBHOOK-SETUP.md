# Square Webhook Setup Guide

This guide will help you configure Square webhooks to track donation payments in real-time.

## What You Need

1. Your Square Application ID (from Square Developer Dashboard)
2. Your Webhook Signing Key (from Square Developer Dashboard)
3. Your Vercel deployment URL (e.g., `https://avisionforyou.vercel.app`)

## Step 1: Get Your Webhook Signing Key

1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Select your application
3. Click **Webhooks** in the left sidebar
4. Under **Webhooks**, look for **Signing key** - copy this value
5. Add it to Vercel as environment variable `SQUARE_WEBHOOK_SIGNATURE_KEY`

## Step 2: Register Your Webhook Endpoint

1. In the Square Developer Dashboard, go to **Webhooks** → **Add Endpoint**
2. Set the endpoint URL to:
   ```
   https://your-vercel-url.vercel.app/api/webhooks/square
   ```
3. Replace `your-vercel-url` with your actual Vercel domain

## Step 3: Select Events to Listen to

Enable these events to track donations:

### Payment Events
- ✅ `payment.created` - New payment initiated
- ✅ `payment.completed` - Payment successful
- ✅ `payment.updated` - Payment status changed
- ✅ `payment.failed` - Payment failed

### Invoice Events (for subscriptions)
- ✅ `invoice.payment_pending` - Invoice awaiting payment
- ✅ `invoice.payment_received` - Invoice paid

### Subscription Events
- ✅ `subscription.created` - New subscription started
- ✅ `subscription.updated` - Subscription details changed
- ✅ `subscription.deleted` - Subscription cancelled

## Step 4: Add to Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add this variable:
   ```
   SQUARE_WEBHOOK_SIGNATURE_KEY = [your signing key from Step 1]
   ```

## Step 5: Test the Webhook (Optional)

In the Square Developer Dashboard:

1. Go to **Webhooks** → Your Endpoint
2. Click **Send Test Event**
3. You should see:
   - Status: `200` (Success)
   - Response shows webhook was processed

## How It Works

When a donation payment completes:

1. **Customer makes a donation** → Payment link generated
2. **Customer completes payment on Square** → Square processes payment
3. **Square sends webhook to your endpoint** → `/api/webhooks/square`
4. **Webhook handler verifies signature** → Security check
5. **Donation status updated in database** → Admin dashboard reflects change
6. **Real-time tracking** → No delays, always up-to-date

## Webhook Events Flow

```
Payment Donation Flow:
┌─────────────────┐
│  Customer      │
│  Donates via   │
│  Square Form   │
└────────┬────────┘
         │
         ├─→ payment.created (donation record created in DB)
         │
         ├─→ payment.completed (donation marked COMPLETED)
         │
         └─→ Email confirmation sent to donor
         
Recurring Donation Flow:
┌─────────────────┐
│  Subscription   │
│  Set up for     │
│  Monthly/Yearly │
└────────┬────────┘
         │
         ├─→ subscription.created (recurring donation created)
         │
         ├─→ Monthly/Yearly: invoice.payment_pending
         │
         ├─→ Monthly/Yearly: invoice.payment_received
         │
         └─→ subscription.updated (renewal date updates)
```

## Troubleshooting

### Webhook Not Firing
- ✓ Check webhook is enabled in Square Dashboard
- ✓ Verify endpoint URL is correct (including https://)
- ✓ Check Vercel logs for errors
- ✓ Verify `SQUARE_WEBHOOK_SIGNATURE_KEY` is set in Vercel

### Invalid Signature Error
- ✓ Confirm `SQUARE_WEBHOOK_SIGNATURE_KEY` matches Square Dashboard exactly
- ✓ Redeploy Vercel after updating environment variables
- ✓ Check for whitespace in key value

### Donations Not Updating
- ✓ Verify webhook logs in Square Dashboard show successful delivery
- ✓ Check Vercel runtime logs for webhook processing errors
- ✓ Confirm donation record exists in database before webhook arrives

## Admin Dashboard

Once webhooks are configured:

1. Go to `/admin/donations`
2. You'll see real-time donation updates
3. Recurring donations show next renewal dates
4. Export CSV anytime for reporting

## Customer Dashboard

Customers can manage their recurring donations at:

- `/dashboard/donations` - View all donations
- See donation status and next renewal dates
- Cancel recurring donations anytime
- Contact support: donate@avisionforyou.org

## Production Checklist

Before going live:

- [ ] SQUARE_WEBHOOK_SIGNATURE_KEY set in Vercel
- [ ] Webhook endpoint registered in Square Dashboard
- [ ] All webhook events enabled
- [ ] Test webhook fires successfully
- [ ] Test payment completes successfully
- [ ] Database migration applied (`add_recurring_donations_and_webhooks`)
- [ ] Admin can see real-time donation updates
- [ ] CSV export works correctly

## Support

For issues with webhooks:
- Square Support: https://squareup.com/help
- Vercel Logs: Check deployment logs for errors
- Database: Check webhook_logs table for event history
