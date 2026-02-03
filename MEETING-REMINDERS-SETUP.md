# Meeting Reminders & Scheduling System Setup Guide

## Overview

This system automatically sends email reminders to users who RSVP'd for meetings:
- **24-hour reminder**: Sent 24 hours before meeting start time
- **1-hour reminder**: Sent 1 hour before meeting start time

## Components

### 1. Database Schema (Prisma)
Updated RSVP model with reminder tracking fields:
- `reminder24hSent`: Boolean - tracks if 24-hour reminder was sent
- `reminder1hSent`: Boolean - tracks if 1-hour reminder was sent

### 2. Email Service (`src/lib/email.ts`)
Functions for sending reminders:
- `sendMeetingReminder()` - Send single reminder to user
- `sendBulkMeetingReminders()` - Process all pending reminders (24h + 1h)

### 3. Cron Endpoint (`src/app/api/cron/reminders/route.ts`)
Protected endpoint that triggers reminder sending:
- Requires `CRON_SECRET` authorization header
- Returns count of reminders sent

### 4. User Notifications Page (`src/app/notifications/page.tsx`)
Dashboard where users can:
- View all upcoming RSVPs
- See reminder status
- Modify or cancel RSVPs

### 5. RSVP Management API (`src/app/api/rsvp/user/route.ts`)
Endpoints for users to:
- View their RSVPs
- Cancel RSVPs
- Track reminder preferences

## Setup Instructions

### Step 1: Update Environment Variables

Add to your `.env` file:

```env
# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Cron Job Security
CRON_SECRET=your_secret_cron_key_here
```

Get your Resend API key from: https://resend.com

### Step 2: Run Prisma Migration

```bash
npx prisma migrate dev --name add_reminder_tracking
```

This adds the reminder fields to your RSVP table.

### Step 3: Set Up External Cron Service

You have several options for triggering the cron job:

#### Option A: Cron-Job.org (Free, Recommended for Getting Started)

1. Go to https://cron-job.org/en/
2. Sign up for free account
3. Click "Create cronjob"
4. Configure:
   - **Title**: "A Vision For You Meeting Reminders"
   - **URL**: `https://yourdomain.com/api/cron/reminders`
   - **Execution time**: Every 10 minutes (set to run frequently)
   - **Request method**: POST
   - **HTTP headers**: Add header
     - **Key**: `Authorization`
     - **Value**: `Bearer your_secret_cron_key_here`

5. Click "Create" and test it

#### Option B: AWS EventBridge (Production Recommended)

1. Go to AWS EventBridge console
2. Create new rule with schedule: `rate(10 minutes)`
3. Add target: HTTPS endpoint
4. Configure headers with Authorization bearer token
5. Set timeout to 60 seconds

#### Option C: Google Cloud Scheduler

1. Go to Google Cloud Console
2. Create new job
3. Set frequency: `*/10 * * * *` (every 10 minutes)
4. HTTP trigger to your endpoint
5. Add Authorization header in HTTP request body

#### Option D: GitHub Actions (Free Alternative)

Create `.github/workflows/meeting-reminders.yml`:

```yaml
name: Meeting Reminders

on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Send meeting reminders
        run: |
          curl -X POST https://yourdomain.com/api/cron/reminders \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Add `CRON_SECRET` to GitHub repository secrets.

### Step 4: Test the System

1. Create a test meeting starting 25 hours from now:
   - Go to `/admin/setup` or admin API
   - Create ProgramSession with title "Test Meeting"

2. RSVP for the meeting:
   - Use API or manually create RSVP record
   - Set user email to your test email

3. Test 24-hour reminder:
   - Call: `POST /api/cron/reminders` with authorization header
   - Check your email for reminder

4. Create another meeting starting 61 minutes from now
5. Test 1-hour reminder similarly

### Step 5: Monitor Reminder Sending

Check logs at:
- Vercel: Deployment logs in dashboard
- Local: Terminal output if running locally
- Resend: Email delivery status at https://resend.com

Watch for patterns:
- Number of reminders sent per cycle
- Email delivery failures
- Processing errors

## User Experience Flow

1. **User RSVP's for meeting**
   - Creates RSVP record with `reminder24hSent: false`, `reminder1hSent: false`

2. **24 hours before meeting**
   - Cron job runs
   - System finds RSVPs where `startDate` is within 24-hour window
   - Sends reminder email with meeting details
   - Updates `reminder24hSent: true`

3. **1 hour before meeting**
   - Cron job runs again
   - System finds RSVPs where `startDate` is within 1-hour window
   - Sends last-minute reminder
   - Updates `reminder1hSent: true`

4. **User can view/manage at any time**
   - `/notifications` page shows all RSVPs
   - Shows reminder delivery status
   - Can cancel RSVP at any time

## Troubleshooting

### Reminders not sending?

1. **Check CRON_SECRET is set correctly**
   ```bash
   echo $CRON_SECRET
   ```

2. **Verify Resend API key is valid**
   - Test at https://resend.com/emails

3. **Check database connection**
   ```bash
   npx prisma studio
   ```

4. **Check cron job logs**
   - Go to cron-job.org and check execution history
   - Look for HTTP 200 response

5. **Test endpoint directly**
   ```bash
   curl -X POST http://localhost:3000/api/cron/reminders \
     -H "Authorization: Bearer your_test_secret"
   ```

### Email formatting issues?

1. Check email template in `/src/lib/email.ts`
2. Test with different email clients
3. Verify meeting data is complete (title, time, location)

### Performance concerns?

- Current system sends reminders in batches
- For 1000+ RSVPs, consider using job queue (Bull, RabbitMQ)
- Monitor Resend rate limits (default: 100 emails/second)

## Email Template Customization

Edit the HTML template in `sendMeetingReminder()` function to:
- Change colors (blue theme currently)
- Add organization branding
- Include custom footer links
- Add unsubscribe options

## Analytics Integration

The system automatically logs:
- Number of reminders sent per cycle
- Delivery status via Resend
- RSVP counts and trends

Access via Admin Dashboard → Analytics tab

## Best Practices

1. ✅ Run cron job every 10 minutes for reliability
2. ✅ Set CRON_SECRET to a strong, random value
3. ✅ Monitor email delivery rates in Resend dashboard
4. ✅ Test with internal team members first
5. ✅ Check logs regularly for errors
6. ✅ Have backup reminder system (SMS optional)
7. ✅ Allow users to opt-out of reminders (future feature)

## Next Steps

1. Deploy Prisma migration to production
2. Set up external cron service
3. Add CRON_SECRET to Vercel environment variables
4. Test with real RSVPs
5. Monitor delivery for 1 week
6. Optimize frequency based on data

## Support

For issues:
1. Check Resend status page: https://status.resend.com
2. Review Prisma docs: https://www.prisma.io/docs
3. Test endpoint with Postman or curl
4. Check GitHub repository for updates
