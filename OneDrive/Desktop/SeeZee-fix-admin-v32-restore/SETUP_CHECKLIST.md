# Setup Checklist for Invoice & Dashboard Fixes

## Quick Setup Steps

### 1. Environment Variables
Add to your `.env` file:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Database Update
```bash
npm run db:push
```

### 3. Install Dependencies (if needed)
All required packages are already in package.json:
- `stripe@^16.12.0`
- `@stripe/stripe-js@^2.1.11`
- `@react-pdf/renderer@^4.0.0`

If you need to reinstall:
```bash
npm install
```

### 4. Set Up Stripe Webhook
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `invoice.paid`
   - `invoice.payment_failed`
   - `invoice.finalized`
   - `invoice.voided`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy webhook secret to `.env`

### 5. Test the Features

#### Test 1: Dashboard "Waiting for Review" Fix
- [ ] Login as client (test user)
- [ ] Submit a project request via `/start`
- [ ] Verify "waiting for review" message appears on dashboard
- [ ] Login as admin
- [ ] Approve project request and create project
- [ ] Login back as client
- [ ] Verify "waiting for review" message is gone

#### Test 2: Invoice with Stripe Payment
- [ ] Login as admin
- [ ] Go to `/admin/invoices`
- [ ] Create a new invoice (will be DRAFT)
- [ ] Click "Send via Stripe"
- [ ] Verify invoice status changes to SENT
- [ ] Login as client
- [ ] Go to `/client/invoices`
- [ ] See the invoice with "Pay now" button
- [ ] Click "Pay now" (opens Stripe payment page)
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete payment
- [ ] Verify invoice status updates to PAID automatically

#### Test 3: PDF Download
- [ ] Login as client
- [ ] Go to `/client/invoices`
- [ ] Click download button on any invoice
- [ ] Verify PDF downloads with proper formatting
- [ ] Check PDF contains:
  - [ ] Company name and details
  - [ ] Invoice number
  - [ ] Client information
  - [ ] Line items
  - [ ] Amounts and totals
  - [ ] Payment status

## Verification Checklist

### Client Dashboard
- [ ] Pre-client view shows for users with pending requests
- [ ] Full dashboard shows for users with active projects
- [ ] "Waiting for review" message only shows for actual pending requests
- [ ] Message disappears when project is created

### Invoice Management (Admin)
- [ ] Can create invoices in DRAFT status
- [ ] "Send via Stripe" button appears on DRAFT invoices
- [ ] Clicking "Send via Stripe" creates Stripe invoice
- [ ] Invoice status updates to SENT after sending
- [ ] Can edit invoice details
- [ ] Can delete invoices

### Invoice Viewing (Client)
- [ ] Can view all their invoices
- [ ] Can see invoice status (DRAFT, SENT, PAID, OVERDUE)
- [ ] "Pay now" button appears on SENT invoices
- [ ] Payment link opens Stripe hosted invoice page
- [ ] Can download invoices as PDF
- [ ] Invoice shows correct amounts and dates

### Stripe Integration
- [ ] Customer auto-created in Stripe (check Stripe dashboard)
- [ ] Invoice created in Stripe (check Stripe dashboard)
- [ ] Payment recorded in Stripe (check Stripe dashboard)
- [ ] Webhook events processed correctly
- [ ] Invoice status syncs automatically

### PDF Generation
- [ ] PDF downloads successfully
- [ ] PDF has professional formatting
- [ ] All invoice data is accurate
- [ ] Status badges show correct colors
- [ ] Company branding appears correctly

## Common Issues and Fixes

### Issue: "Waiting for review" still shows after project creation
**Fix:** 
- Check that the project request has `project` field populated
- Refresh the client dashboard
- Verify the API endpoint `/api/client/requests` returns project data

### Issue: "Send via Stripe" fails
**Fix:**
- Verify `STRIPE_SECRET_KEY` is set correctly in `.env`
- Check organization has an email address
- Verify Stripe API key is for the correct environment (test/live)

### Issue: Webhook not updating invoice status
**Fix:**
- Verify `STRIPE_WEBHOOK_SECRET` is set in `.env`
- Check webhook endpoint is publicly accessible
- Review Stripe webhook logs for errors
- Ensure webhook events are selected in Stripe dashboard

### Issue: PDF download fails
**Fix:**
- Check invoice has all required data (items, organization, etc.)
- Verify client has access to the invoice
- Check browser console for errors

### Issue: Client can't see payment button
**Fix:**
- Ensure invoice status is "SENT"
- Verify invoice has `stripeInvoiceId` in database
- Check that Stripe invoice was finalized

## Production Deployment

Before deploying to production:
1. [ ] Update Stripe keys to production keys in `.env`
2. [ ] Set up production webhook endpoint
3. [ ] Test with real payment (small amount)
4. [ ] Verify webhook processing in production
5. [ ] Test PDF downloads in production
6. [ ] Verify email notifications (if configured)

## Support and Documentation

- **Main Summary:** See `INVOICE_AND_DASHBOARD_FIX_SUMMARY.md`
- **Stripe Docs:** https://stripe.com/docs/invoicing
- **React PDF Docs:** https://react-pdf.org/

## Next Steps (Optional Enhancements)

- [ ] Add email notifications for invoice status changes
- [ ] Implement automatic overdue detection (cron job)
- [ ] Add invoice filtering and search
- [ ] Create invoice templates for different services
- [ ] Add payment history/receipts page
- [ ] Implement partial payment support
- [ ] Add multi-currency support

