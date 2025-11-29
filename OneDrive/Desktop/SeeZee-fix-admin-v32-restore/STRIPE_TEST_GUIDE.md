# Stripe Testing Guide

## Stripe Test Cards

Use these test cards in Stripe's test mode:

### Successful Payments
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., 12/34)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

### Payment Failures
- **Declined Card:** `4000 0000 0000 0002`
- **Insufficient Funds:** `4000 0000 0000 9995`
- **Card Expired:** `4000 0000 0000 0069`

## Testing Workflow

### 1. Initial Setup
```bash
# Make sure you're using test keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Create Test Invoice (Admin)
1. Login as admin/CEO
2. Navigate to `/admin/invoices`
3. Click "Create Invoice"
4. Fill in details:
   - Select organization
   - Add line items
   - Set due date
   - Click "Create"

### 3. Send via Stripe (Admin)
1. Find the newly created invoice (status: DRAFT)
2. Click "Send via Stripe" button
3. System will:
   - Create Stripe customer (first time only)
   - Create Stripe invoice
   - Add line items
   - Finalize and send invoice
4. Invoice status changes to SENT

### 4. Verify in Stripe Dashboard
1. Go to https://dashboard.stripe.com/test/invoices
2. Find your invoice
3. Note the invoice URL (should be visible)
4. Check customer was created in https://dashboard.stripe.com/test/customers

### 5. Pay Invoice (Client)
1. Login as client
2. Go to `/client/invoices`
3. Find invoice with status "SENT"
4. Click "Pay now" button
5. Stripe hosted invoice page opens
6. Enter test card: `4242 4242 4242 4242`
7. Complete payment

### 6. Verify Webhook Processing
1. Payment completes
2. Stripe sends webhook to `/api/webhooks/stripe`
3. System processes `invoice.paid` event
4. Invoice status updates to PAID
5. Payment record created in database

### 7. Check Results
1. Refresh client dashboard
2. Invoice should show as PAID
3. Check Stripe dashboard - payment should show as successful
4. Check database - `Invoice.status` should be "PAID"

## Webhook Testing

### Local Development with Stripe CLI

1. Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (via Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

2. Login to Stripe:
```bash
stripe login
```

3. Forward webhooks to local server:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. Copy the webhook secret shown and update `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

5. Test webhook:
```bash
stripe trigger invoice.paid
```

### Testing Webhook Events

**Test Invoice Payment:**
```bash
stripe trigger invoice.paid
```

**Test Payment Failure:**
```bash
stripe trigger invoice.payment_failed
```

**Test Invoice Finalization:**
```bash
stripe trigger invoice.finalized
```

## Debugging Stripe Issues

### Check Stripe Dashboard Logs
1. Go to https://dashboard.stripe.com/test/logs
2. Filter by event type
3. Check for any errors

### Check Webhook Logs
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. View "Recent events"
4. Check response status codes

### Common Issues

**Issue: Webhook signature verification failed**
- **Fix:** Make sure `STRIPE_WEBHOOK_SECRET` matches the secret in Stripe dashboard

**Issue: Customer creation fails**
- **Fix:** Ensure organization has valid email address

**Issue: Invoice not appearing in Stripe**
- **Fix:** Check Stripe API logs for errors, verify API key is correct

**Issue: Payment not updating status**
- **Fix:** Check webhook is receiving events, verify database update is working

## Test Scenarios

### Scenario 1: Happy Path
1. Create invoice → DRAFT
2. Send via Stripe → SENT
3. Client pays → PAID
4. ✅ Success

### Scenario 2: Payment Failure
1. Create invoice → DRAFT
2. Send via Stripe → SENT
3. Client tries to pay with declined card → SENT (still)
4. System marks as OVERDUE if past due date

### Scenario 3: Multiple Invoices
1. Create 3 invoices for same organization
2. Send all via Stripe
3. Customer pays 2 out of 3
4. Verify correct invoices are marked PAID

### Scenario 4: PDF Download
1. Create and send invoice
2. Client downloads PDF
3. Verify PDF contains all correct information

## Stripe Dashboard Quick Links

- **Test Mode Home:** https://dashboard.stripe.com/test
- **Invoices:** https://dashboard.stripe.com/test/invoices
- **Customers:** https://dashboard.stripe.com/test/customers
- **Payments:** https://dashboard.stripe.com/test/payments
- **Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Logs:** https://dashboard.stripe.com/test/logs
- **Developers:** https://dashboard.stripe.com/test/developers

## Moving to Production

### Before Going Live:
1. [ ] Switch to production API keys
2. [ ] Update webhook endpoint for production URL
3. [ ] Test with real card (small amount)
4. [ ] Verify webhook processing works
5. [ ] Check email notifications (if configured)
6. [ ] Review Stripe account settings
7. [ ] Set up proper error alerting

### Production Checklist:
- [ ] `STRIPE_SECRET_KEY` uses `sk_live_...`
- [ ] `STRIPE_PUBLISHABLE_KEY` uses `pk_live_...`
- [ ] Webhook endpoint is publicly accessible
- [ ] `STRIPE_WEBHOOK_SECRET` is from production webhook
- [ ] Stripe account is fully verified
- [ ] Business details are complete in Stripe
- [ ] Bank account is connected for payouts

## Support

If you encounter issues with Stripe integration:
1. Check the Stripe dashboard logs
2. Review webhook event history
3. Check server logs for errors
4. Contact Stripe support for account-specific issues

## Resources

- **Stripe Testing:** https://stripe.com/docs/testing
- **Stripe Invoicing:** https://stripe.com/docs/invoicing
- **Stripe Webhooks:** https://stripe.com/docs/webhooks
- **Stripe CLI:** https://stripe.com/docs/stripe-cli

## Security Best Practices

- ✅ Never expose secret keys in client-side code
- ✅ Always verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Keep Stripe libraries up to date
- ✅ Log payment activities
- ✅ Monitor for unusual patterns
- ✅ Use Stripe's fraud detection tools

