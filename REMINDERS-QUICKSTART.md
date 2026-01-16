# Meeting Scheduling & Reminder System - Quick Start

## What's Been Set Up

Your meeting scheduling and reminder system is now live with automatic email reminders to users who RSVP for meetings:

### 🔔 Reminder Timing
- **24 hours before**: First reminder email sent
- **1 hour before**: Last-minute reminder email sent
- Both reminders include meeting details, location/link, and time

### 📧 Email Service
- **Provider**: Resend (resend.com)
- **Status**: Ready to deploy (needs API key)
- **Template**: Professional HTML emails with meeting info

### 🎯 User Experience

1. **RSVP Management** (`/notifications`)
   - View all upcoming meeting RSVPs
   - See reminder delivery status
   - Cancel RSVPs if needed
   - Notification bell icon in navbar

2. **Seamless Workflow**
   - User RSVPs for meeting → Creates RSVP record
   - Automatic reminders sent at scheduled times
   - User can view/manage all RSVPs in dashboard
   - One click to cancel RSVP

3. **Admin Controls**
   - Create meetings at `/admin` or via API
   - View all RSVPs and reminder status
   - Track reminder delivery success

## Quick Setup Checklist

### ✅ Already Done
- [x] Email service integration (Resend)
- [x] Database schema updated with reminder tracking
- [x] Notifications page created
- [x] Navbar updated with notifications link
- [x] API endpoints created
- [x] Cron job endpoint ready

### ⏳ You Need to Do

1. **Get Resend API Key** (5 min)
   - Go to https://resend.com
   - Sign up (free account works)
   - Copy API key
   - Add to `.env`: `RESEND_API_KEY=re_xxxxx`

2. **Set Cron Secret** (1 min)
   - Generate random string (e.g., `openssl rand -base64 32`)
   - Add to `.env`: `CRON_SECRET=your_random_string`

3. **Deploy Prisma Migration** (2 min)
   - Run: `npx prisma migrate dev --name add_reminder_tracking`
   - This adds reminder fields to your database

4. **Set Up External Cron Service** (10 min - Pick ONE)

   **Option A: Cron-Job.org (Easiest - Free)**
   - Go to https://cron-job.org
   - Sign up (free)
   - Create cronjob:
     - URL: `https://yourdomain.com/api/cron/reminders`
     - Method: POST
     - Add Header: `Authorization: Bearer your_cron_secret`
     - Schedule: Every 10 minutes
   - Click Save

   **Option B: Vercel Crons (Built-in)**
   - Create `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/cron/reminders",
       "schedule": "*/10 * * * *"
     }]
   }
   ```
   - Add `CRON_SECRET` to Vercel env vars
   - Deploy

5. **Add Environment Variables to Vercel** (5 min)
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add `RESEND_API_KEY`
   - Add `CRON_SECRET`
   - Redeploy

6. **Test It Out** (5 min)
   - Create test meeting 25 hours from now
   - RSVP for meeting
   - Manually call cron endpoint to test
   - Check your email for reminder

## API Endpoints

### Cron Reminders
```bash
POST /api/cron/reminders
Authorization: Bearer CRON_SECRET

# Response
{
  "success": true,
  "sent24h": 5,
  "sent1h": 2,
  "total": 7
}
```

### User RSVPs
```bash
# Get user's RSVPs
GET /api/rsvp/user
Authorization: Bearer (from session)

# Cancel RSVP
DELETE /api/rsvp/user
Body: { "rsvpId": "xxx" }
```

### Create RSVP
```bash
POST /api/rsvp
Body: { 
  "sessionId": "xxx",
  "status": "CONFIRMED" 
}
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── cron/reminders/route.ts      ← Cron endpoint
│   │   └── rsvp/user/route.ts            ← User RSVP management
│   └── notifications/page.tsx            ← User dashboard
├── lib/
│   └── email.ts                          ← Email service
└── components/layout/
    └── Navbar.tsx                        ← Updated with notifications

prisma/
└── schema.prisma                         ← Updated with reminder fields
```

## Monitoring

### Email Delivery
- Dashboard: https://resend.com/emails
- Check delivery status for each reminder
- Monitor bounce rates and failures

### Cron Job Runs
- Cron-Job.org: Check execution history
- Vercel: Check function logs in dashboard
- Local: Watch terminal output during development

### Database
- Verify reminders sent: 
  ```bash
  npx prisma studio
  # Check RSVP table → reminder24hSent, reminder1hSent fields
  ```

## Troubleshooting

**Reminders not sending?**
1. Check `RESEND_API_KEY` is valid at resend.com
2. Verify `CRON_SECRET` matches your cron service
3. Check database connection in Prisma Studio
4. Look at cron job execution logs
5. Test endpoint manually with curl

**Email formatting issues?**
- Edit template in `src/lib/email.ts`
- Change colors, add branding, customize footer
- Test with personal email first

**Meetings showing in notifications but no reminders?**
- Ensure meeting `startDate` is set correctly
- Check reminders haven't been sent already (check DB)
- Verify email address in user profile is correct

## Next Features (Future)

- SMS reminders option
- User preferences for reminder timing
- Unsubscribe from reminders
- Calendar integration (Google Cal, Outlook)
- In-app push notifications
- WhatsApp reminders
- Automated no-show tracking
- Attendance badges for leaderboard

## Support

See `MEETING-REMINDERS-SETUP.md` for:
- Detailed setup instructions
- All cron service options
- Advanced configuration
- Production best practices
- Performance optimization

## Summary

**What Works Now:**
✅ Users can RSVP for meetings
✅ Automatic email reminders 24h + 1h before
✅ Notification dashboard to view/manage RSVPs
✅ Admin can create and track meetings
✅ RSVP status and reminder tracking

**What's Next:**
1. Add Resend API key
2. Set up cron job (pick your service)
3. Test with real RSVPs
4. Deploy to production
5. Monitor reminder delivery

**Build Status:** ✅ Compiling successfully, ready to deploy!
