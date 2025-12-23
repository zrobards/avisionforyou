# Maintenance Billing System Implementation

## Overview

This document outlines the complete hybrid maintenance billing system for SeeZee Studios, designed for nonprofit organizations.

## Tier Structure

### Nonprofit Essentials ($500/month)
- 4 support hours included
- 3 change requests per month
- 2 subscriptions included (max 3)
- Rollover: up to 8 hours, expires in 60 days

### Digital Director ($750/month)
- 10 support hours included
- Unlimited change requests
- 4 subscriptions included (max 6)
- Rollover: up to 20 hours, expires in 90 days

### COO Package ($2000/month)
- Unlimited support hours
- Unlimited change requests
- 6 subscriptions included (max 8)
- No rollover needed (unlimited)

## Files Created

### Configuration
- **[src/lib/config/tiers.ts](src/lib/config/tiers.ts)** - Centralized tier configuration with all pricing, hours, limits, and helper functions

### Backend Libraries
- **[src/lib/hours/tracker.ts](src/lib/hours/tracker.ts)** - Core hours tracking with FIFO deduction, rollover processing, and balance calculation
- **[src/lib/hours/warnings.ts](src/lib/hours/warnings.ts)** - Email warning system for usage thresholds and expiring hours

### UI Components
- **[src/components/client/HoursBank.tsx](src/components/client/HoursBank.tsx)** - Visual hours balance display with progress bars and expiring hours warnings
- **[src/components/admin/AdminHoursLogger.tsx](src/components/admin/AdminHoursLogger.tsx)** - Admin interface for logging hours against change requests

### Pages
- **[src/app/(client)/client/hours/page.tsx](src/app/(client)/client/hours/page.tsx)** - Hour Pack marketplace with 4 pack options
- **[src/app/(client)/client/requests/new/page.tsx](src/app/(client)/client/requests/new/page.tsx)** - Change request submission form with hours estimation
- **[src/app/(client)/client/settings/billing/page.tsx](src/app/(client)/client/settings/billing/page.tsx)** - Billing settings with on-demand toggle and spend caps

### Server Actions
- **[src/app/(client)/client/actions/hours.ts](src/app/(client)/client/actions/hours.ts)** - Server action to fetch hours balance for authenticated user

## Database Schema Updates

The following updates were made to `prisma/schema.prisma`:

### New Enums
- `NonprofitTier` - ESSENTIALS, DIRECTOR, COO
- `HourPackType` - SMALL, MEDIUM, LARGE, PREMIUM
- `ChangeRequestCategory` - CONTENT, DESIGN, FUNCTIONALITY, etc.
- `ChangeRequestPriority` - LOW, NORMAL, HIGH, URGENT
- `UsageWarningLevel` - AT_80_PERCENT, AT_2_HOURS, AT_LIMIT, etc.

### MaintenancePlan Enhancements
- `subscriptionsIncluded` / `maxSubscriptions` - Tier-based subscription limits
- `supportHoursIncluded` / `supportHoursUsed` - Hours pool tracking
- `changeRequestsIncluded` / `changeRequestsUsed` - Request counting
- `rolloverEnabled` / `rolloverCap` / `rolloverHours` - Rollover system
- `onDemandEnabled` / `hourlyOverageRate` / `dailySpendCap` / `monthlySpendCap` - On-demand billing
- `gracePeriodUsed` - One-time 1-hour grace tracking

### New Models
- `HourPack` - Purchased hour packs with expiration
- `RolloverHours` - Individual rollover entries with FIFO tracking
- `OverageNotification` - Email notification tracking

### ChangeRequest Enhancements
- `estimatedHours` / `actualHours` / `hoursDeducted` - Hours tracking
- `hoursSource` - Where hours were deducted from
- `category` / `priority` / `urgencyFee` - Request classification
- `isOverage` / `overageAmount` - Overage tracking

## Hour Pack Options

| Pack | Hours | Price | Validity | Effective Rate |
|------|-------|-------|----------|----------------|
| Starter | 5 | $350 | 60 days | $70/hour |
| Growth | 10 | $650 | 90 days | $65/hour |
| Scale | 20 | $1,200 | 120 days | $60/hour |
| Premium | 10 | $850 | Never | $85/hour |

## Deduction Priority (FIFO)

1. **Expiring rollover hours** (oldest first)
2. **Expiring hour packs** (oldest first)
3. **Monthly included hours**
4. **Never-expiring hour packs**
5. **On-demand/overage** (if enabled)

## Warning Email Triggers

- At 80% of monthly hours used
- At 2 hours remaining
- When monthly limit reached
- Before first overage
- 30/14/7 days before rollover expiration
- 30/14/7 days before hour pack expiration

## On-Demand Settings

- Hourly rate: $75
- Daily request limit: 3
- Daily spend cap: $500
- Monthly spend cap: $2,000
- Urgent requests per week: 2

## Urgency Fees

- Low: No fee
- Normal: No fee
- High: +$50 (24-hour response)
- Urgent: +$100 (same-day response)

## Integration with Dashboard

The HoursBank component is integrated into the client dashboard:
- Shows current hours balance (monthly + rollover + packs)
- Displays progress bar for usage
- Warns about expiring hours
- Links to hour pack purchase page
- Links to billing settings

## Migration Required

To apply these schema changes:

```bash
# Generate Prisma client
npx prisma generate

# Apply schema changes to database
npx prisma db push

# Or create a proper migration
npx prisma migrate dev --name add_billing_system
```

## Next Steps

1. **Stripe Integration** - Connect hour pack purchases to Stripe checkout
2. **Cron Jobs** - Set up scheduled tasks for:
   - Monthly rollover processing
   - Expired hours cleanup
   - Warning email triggers
3. **Admin Dashboard** - Add hours management to admin interface
4. **Reporting** - Add usage reports and analytics
5. **Invoice Generation** - Integrate overage billing with invoices
