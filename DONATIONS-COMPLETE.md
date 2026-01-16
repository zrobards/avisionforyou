# Complete Donations System Implementation

## Overview

Your donations system is now fully implemented with:
- ✅ One-time donations via Square Payment Links
- ✅ Recurring donations (Monthly & Yearly) via Square Subscriptions
- ✅ Real-time webhook updates from Square
- ✅ Admin dashboard for tracking all donations
- ✅ Customer dashboard for managing recurring donations
- ✅ CSV export for documentation

## What Customers Experience

### Making a Donation

1. Visit `/donate`
2. Select donation amount ($25, $50, $100, $250, $500, or custom)
3. Choose frequency:
   - **One-Time**: Single payment
   - **Monthly**: Recurring payment on anniversary date (2x impact badge)
   - **Yearly**: Annual payment on anniversary date (Best badge)
4. Enter name and email
5. Click "Donate Now"
6. Redirected to Square secure checkout
7. Complete payment with card
8. Confirmation email sent
9. Redirected to success page
10. Donation tracked in admin dashboard immediately

### Managing Recurring Donations

Customers can view and manage donations at `/dashboard/donations`:
- View all donations with status and amounts
- Filter by One-Time, Recurring, or Active
- See next renewal date for recurring donations
- Cancel recurring donations anytime
- Download donation history

## What Admin Sees

### Donations Dashboard

At `/admin/donations`, admins see:

**Statistics:**
- Total Raised (all donations)
- Average Donation Amount
- Monthly Recurring Revenue
- Success Rate %

**Controls:**
- Search by name or email
- Filter by status (Completed, Pending, Failed)
- Filter by frequency (One-Time, Monthly, Yearly)
- View detailed donation history
- **Download all donations as CSV** for documentation

**Real-Time Updates:**
- Donations update instantly via webhooks
- No delay between payment and dashboard update
- Webhook events logged for audit trail

## Technical Implementation

### Frontend

**Donation Form** (`/src/app/donate/page.tsx`)
```tsx
- Amount selection (preset or custom)
- Frequency selection (ONE_TIME, MONTHLY, YEARLY)
- Name and email input
- Payment method selector (Square)
- Validation and error handling
- Loading states and confirmation
```

**Customer Dashboard** (`/src/app/dashboard/donations/page.tsx`)
```tsx
- Authenticated users only
- Shows all user donations
- Filter by type and status
- Cancel recurring donations
- Next renewal date display
```

### Backend

**Donation Creation** (`/src/app/api/donate/square/route.ts`)
```ts
1. Validate input (email, name, amount, frequency)
2. Create donation record in database (status: PENDING)
3. Calculate next renewal date (anniversary-based)
4. Create Square Payment Link
5. Send confirmation email
6. Return checkout URL to frontend
```

**Webhook Handler** (`/src/app/api/webhooks/square/route.ts`)
```ts
1. Receive webhook from Square
2. Verify signature (security)
3. Log event for audit trail
4. Process event based on type:
   - payment.completed → Update status to COMPLETED
   - subscription.created → Link subscription ID
   - subscription.deleted → Cancel donation
5. Update donation in database
6. Return success response
```

**Customer Endpoints**
```ts
GET /api/donations/my-donations
  - Fetch all donations for authenticated user
  - Ordered by date (newest first)

POST /api/donations/[donationId]/cancel
  - Cancel recurring donation
  - Update status to CANCELLED
  - Send cancellation to Square
```

### Database Schema Updates

**Donation Model** - Added fields:
```prisma
squareSubscriptionId String?    // Link to Square subscription
nextRenewalDate DateTime?       // When next payment processes
renewalSchedule String          // "anniversary" (same day each month/year)
recurringStartDate DateTime?    // When recurring started
cancelledAt DateTime?           // When donor cancelled
```

**New WebhookLog Model**
```prisma
provider String                 // "square", "stripe", etc.
eventType String               // Event type from provider
eventId String                 // Unique event ID
donationId String?             // Related donation
data Json                      // Full webhook payload
status String                  // processed, failed, pending
createdAt DateTime             // When received
processedAt DateTime?          // When processed
```

## Renewal Schedule (Anniversary-Based)

Recurring donations renew on the **same day they started**:

**Example:**
- Customer donates monthly on December 22, 2024
- Next payment: January 22, 2025
- Then: February 22, 2025
- Then: March 22, 2025
- And so on...

This provides consistent, predictable billing for donors.

## Real-Time Tracking

### Webhook Events Processed

**Payment Events:**
- `payment.created` - Payment initiated
- `payment.completed` - Payment successful ✅
- `payment.updated` - Status changed
- `payment.failed` - Payment failed ❌

**Invoice Events (Recurring):**
- `invoice.payment_pending` - Invoice awaiting payment
- `invoice.payment_received` - Invoice paid ✅

**Subscription Events:**
- `subscription.created` - Recurring donation started
- `subscription.updated` - Details changed (renewal date, etc.)
- `subscription.deleted` - Subscription cancelled

### Status Flow

```
ONE-TIME DONATION:
  PENDING (form submitted)
    ↓
  COMPLETED (payment.completed webhook)
    ↓
  [Admin dashboard shows immediately]

RECURRING DONATION:
  PENDING (form submitted)
    ↓
  COMPLETED (initial payment received)
    ↓
  PENDING (next renewal approaching)
    ↓
  COMPLETED (recurring payment received)
    ↓
  CANCELLED (if donor cancels)
```

## Admin CSV Export

At `/admin/donations`, click "Download CSV":

**Columns:**
- Date
- Name
- Email
- Amount
- Currency (USD)
- Frequency (ONE_TIME, MONTHLY, YEARLY)
- Status (PENDING, COMPLETED, FAILED, CANCELLED)
- Comment (if any)

**Filename:** `donations_[date].csv`

Perfect for:
- IRS documentation
- Annual reports
- Grant applications
- Financial analysis

## What Needs Your Action

### 1. **Database Migration** (REQUIRED)
Run this to create new tables:
```bash
npx prisma migrate deploy
```

This creates:
- New columns in `donations` table
- New `webhook_logs` table

### 2. **Square Webhook Setup** (REQUIRED)
Follow the [Webhook Setup Guide](./WEBHOOK-SETUP.md):
1. Get webhook signing key from Square
2. Add to Vercel as `SQUARE_WEBHOOK_SIGNATURE_KEY`
3. Register webhook endpoint in Square Dashboard
4. Enable webhook events

### 3. **Test Everything** (IMPORTANT)
1. Test one-time donation with test card: `4532 0151 1283 0366`
2. Verify status updates in `/admin/donations`
3. Test monthly donation
4. Verify renewal date shows correctly
5. Test cancellation at `/dashboard/donations`
6. Export CSV to verify format

### 4. **Production Credentials** (BEFORE LAUNCH)
- Switch to production Square credentials
- Update environment variables
- Webhook signing key for production
- Test with real card (will be refunded)

## File Changes Summary

**Modified Files:**
- `prisma/schema.prisma` - Added subscription fields and WebhookLog model
- `src/app/donate/page.tsx` - Added YEARLY option, removed recurring donation warning
- `src/app/api/donate/square/route.ts` - Added recurring donation support

**New Files:**
- `src/app/api/webhooks/square/route.ts` - Webhook handler
- `src/app/api/donations/my-donations/route.ts` - Fetch user donations
- `src/app/api/donations/[donationId]/cancel/route.ts` - Cancel recurring
- `src/app/dashboard/donations/page.tsx` - Customer dashboard
- `WEBHOOK-SETUP.md` - Webhook configuration guide

## Environment Variables Needed

```env
# Existing
SQUARE_ACCESS_TOKEN=your_square_token
SQUARE_ENVIRONMENT=sandbox  # or production

# NEW - Required for webhooks
SQUARE_WEBHOOK_SIGNATURE_KEY=whsec_your_webhook_signing_key
```

## Support & Next Steps

1. **Run migration:** `npx prisma migrate deploy`
2. **Set webhook key in Vercel:** Add `SQUARE_WEBHOOK_SIGNATURE_KEY`
3. **Configure webhook:** Follow `WEBHOOK-SETUP.md`
4. **Test end-to-end:** One-time and recurring donations
5. **Launch!** Share donation link at `/donate`

## Verification Checklist

- [ ] Database migration applied
- [ ] SQUARE_WEBHOOK_SIGNATURE_KEY in Vercel
- [ ] Webhook endpoint registered in Square Dashboard
- [ ] One-time donation works
- [ ] Monthly donation works
- [ ] Yearly donation works
- [ ] Admin dashboard shows real-time updates
- [ ] Customer can see donations at `/dashboard/donations`
- [ ] Customer can cancel recurring donations
- [ ] CSV export works
- [ ] Donation confirmation emails sent
- [ ] Webhook events logged

You're all set! 🚀
