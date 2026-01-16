# Meetings & RSVP System - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- PostgreSQL database (Neon or local)
- Environment variables configured (see below)

### Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (for reminders)
RESEND_API_KEY="re_xxxxx"

# Optional - for external cron services
CRON_SECRET="your-cron-secret"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

---

## 📋 Testing Checklist

### 1. Create an Admin User

First, you need an admin user to create meetings. You can either:

**Option A: Update existing user in database**
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

**Option B: Use Prisma Studio**
```bash
npx prisma studio
# Navigate to User model
# Find your user and change role to 'ADMIN'
```

### 2. Create a Test Meeting

1. **Login as admin:** Visit `http://localhost:3000/login`
2. **Go to admin meetings:** Visit `http://localhost:3000/admin/meetings`
3. **Click "New Meeting"**
4. **Fill in the form:**
   - Title: "Weekly Recovery Group"
   - Description: "Open discussion and peer support"
   - Start Date/Time: Tomorrow at 6:00 PM
   - End Date/Time: Tomorrow at 7:00 PM
   - Format: Online
   - Link: https://zoom.us/j/123456789
   - Capacity: 10 (or leave empty for unlimited)
5. **Click "Create Meeting"**

### 3. Test Public Meeting Listing

1. **Logout** (or open incognito window)
2. **Visit** `http://localhost:3000/meetings`
3. **Verify:**
   - Meeting appears in the list
   - Shows correct date, time, location/link
   - Shows "0 / 10 RSVPs" (or "0 / ∞" if no capacity)
   - "Sign In to RSVP" button appears

### 4. Test RSVP Flow

1. **Create/login as regular user** (not admin)
2. **Visit** `http://localhost:3000/meetings`
3. **Click "RSVP Now"** on your test meeting
4. **Verify:**
   - Button changes to "Cancel RSVP"
   - Badge shows "✓ Going"
   - RSVP count increases to 1

### 5. Test Capacity Limit

If you set a capacity limit:

1. **Create 2 more test users**
2. **RSVP with each user** until you reach capacity
3. **Try to RSVP with another user**
4. **Verify:** Error message "Meeting is at full capacity"

### 6. Test Notifications Dashboard

1. **Login as user with RSVPs**
2. **Visit** `http://localhost:3000/notifications`
3. **Verify:**
   - Your RSVP appears
   - Shows reminder status indicators
   - Can click "Cancel RSVP"
   - Link to meeting works (if online)

### 7. Test Admin Features

1. **Login as admin**
2. **Visit** `http://localhost:3000/admin/meetings`
3. **Test search:** Type in search box
4. **Test filters:** Try different format filters
5. **View RSVPs:** Click on the RSVP count
6. **Export RSVPs:** Click the download icon (should download CSV)
7. **Edit meeting:** Click edit icon, modify details, save
8. **Delete meeting:** Click delete icon (⚠️ be careful!)

### 8. Test Email Reminders (Manual Trigger)

1. **Ensure RESEND_API_KEY is set**
2. **Create a meeting 25 hours in the future**
3. **RSVP to the meeting**
4. **Manually trigger cron job:**

```bash
# If you have CRON_SECRET set
curl -X POST http://localhost:3000/api/cron/reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Or just visit the URL in browser (works for local testing)
curl -X GET http://localhost:3000/api/cron/reminders
```

5. **Verify:** No emails sent yet (meeting is >24h away)
6. **Update meeting to be 23 hours away** (or wait)
7. **Trigger cron again**
8. **Verify:** 24-hour reminder email sent
9. **Update meeting to be 59 minutes away**
10. **Trigger cron again**
11. **Verify:** 1-hour reminder email sent

---

## 🔄 Real-Time Updates

The system automatically polls for updates:

- **Meetings page:** Every 15 seconds
- **Admin meetings:** Every 3 seconds
- **Notifications:** Every 30 seconds

To test:
1. Open same page in 2 browser windows
2. Make a change in one window (RSVP, create meeting, etc.)
3. Watch other window update automatically

---

## 📊 Filter Testing

### Program Filter
1. Create meetings with different program types
2. Use program filter dropdown
3. Verify only matching meetings show

### Format Filter
1. Create online and in-person meetings
2. Use format filter
3. Verify filtering works correctly

---

## 💾 CSV Export Testing

1. **Create meeting with multiple RSVPs**
2. **Go to admin meetings page**
3. **Click download icon** next to RSVP count
4. **Open CSV file**
5. **Verify contents:**
   ```csv
   Name,Email,Status,RSVP Date
   "John Doe","john@example.com","CONFIRMED","2026-01-15"
   ```

---

## 🐛 Common Issues & Solutions

### Issue: "Meeting is at full capacity" but it's not full

**Solution:** Check RSVP status. Capacity only counts CONFIRMED RSVPs.
```sql
-- Check RSVP counts
SELECT sessionId, status, COUNT(*) 
FROM rsvps 
GROUP BY sessionId, status;
```

### Issue: Reminder emails not sending

**Solutions:**
1. Check `RESEND_API_KEY` is set correctly
2. Verify email domain is verified in Resend
3. Check console logs for errors
4. Test Resend API key:
```bash
curl https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "test@yourdomain.com",
    "to": "you@example.com",
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

### Issue: Can't create meetings (403 Forbidden)

**Solution:** Ensure your user has ADMIN or STAFF role:
```sql
SELECT email, role FROM users WHERE email = 'your-email@example.com';
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### Issue: RSVPs not showing in admin panel

**Solution:** Check database relationships:
```sql
-- View all RSVPs with user details
SELECT r.id, r.status, u.name, u.email, ps.title 
FROM rsvps r
JOIN users u ON r.userId = u.id
JOIN program_sessions ps ON r.sessionId = ps.id;
```

### Issue: Meetings not appearing on public page

**Solution:** Check start date is in the future:
```sql
-- View all upcoming meetings
SELECT id, title, startDate 
FROM program_sessions 
WHERE startDate > NOW() 
ORDER BY startDate;
```

---

## 🎯 Feature Testing Matrix

| Feature | Test Steps | Expected Result |
|---------|------------|-----------------|
| Create Meeting | Admin creates meeting | Meeting appears in list |
| RSVP | User clicks RSVP button | Status changes to "Going" |
| Cancel RSVP | User clicks Cancel | RSVP removed from list |
| Capacity Check | RSVP to full meeting | Error message shown |
| Program Filter | Select program type | Filtered meetings shown |
| Format Filter | Select format | Filtered meetings shown |
| CSV Export | Click download icon | CSV file downloads |
| Edit Meeting | Admin edits details | Changes saved and shown |
| Delete Meeting | Admin deletes meeting | Meeting removed from list |
| 24h Reminder | Cron runs 24h before | Email sent, flag updated |
| 1h Reminder | Cron runs 1h before | Email sent, flag updated |
| Notifications | Visit dashboard | All RSVPs shown |
| Cancel from Dashboard | Click Cancel RSVP | RSVP removed |

---

## 📱 API Testing with cURL

### Create RSVP
```bash
curl -X POST http://localhost:3000/api/rsvp \
  -H "Content-Type: application/json" \
  -b "next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"sessionId": "meeting-id-here"}'
```

### Get User's RSVPs
```bash
curl http://localhost:3000/api/rsvp/user \
  -b "next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Cancel RSVP
```bash
curl -X DELETE http://localhost:3000/api/rsvp \
  -H "Content-Type: application/json" \
  -b "next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"sessionId": "meeting-id-here"}'
```

### Admin: Get All Meetings
```bash
curl http://localhost:3000/api/admin/meetings \
  -b "next-auth.session-token=YOUR_ADMIN_SESSION_TOKEN"
```

### Trigger Reminder Cron
```bash
curl -X POST http://localhost:3000/api/cron/reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🎨 UI Testing Tips

### Browser DevTools
1. **Network tab:** Watch API calls in real-time
2. **Console:** Check for errors or warnings
3. **Application tab:** View session cookies and storage

### Mobile Testing
1. Use Chrome DevTools device emulation
2. Test on actual mobile devices
3. Verify responsive design (1/2/3 column grid)

### Accessibility Testing
1. Tab through forms (keyboard navigation)
2. Test with screen reader
3. Verify color contrast

---

## 📈 Performance Testing

### Load Testing
```bash
# Install Apache Bench
brew install ab  # macOS
apt-get install apache2-utils  # Linux

# Test meetings endpoint
ab -n 100 -c 10 http://localhost:3000/api/meetings?upcoming=true
```

### Database Performance
```sql
-- Check slow queries
EXPLAIN ANALYZE SELECT * FROM program_sessions 
WHERE startDate > NOW() 
ORDER BY startDate;

-- Check index usage
\d program_sessions
```

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in Vercel
- [ ] RESEND_API_KEY configured and domain verified
- [ ] Vercel Cron job configured (automatic from vercel.json)
- [ ] Database migrations run on production database
- [ ] At least one admin user created
- [ ] Test email reminders work
- [ ] Test RSVP flow end-to-end
- [ ] Test capacity limits
- [ ] Test CSV export
- [ ] Verify real-time updates work
- [ ] Check mobile responsiveness
- [ ] Test with different user roles (USER, ADMIN)

---

## 🔐 Security Checklist

- [ ] Authentication required for all RSVP operations
- [ ] Admin-only routes protected
- [ ] CSRF protection enabled (NextAuth)
- [ ] Rate limiting configured (if applicable)
- [ ] No sensitive data in API responses
- [ ] Cron endpoint secured with Bearer token
- [ ] Input validation on all forms
- [ ] SQL injection prevention (Prisma ORM)

---

## 📞 Need Help?

### Check Logs
```bash
# Development server logs
npm run dev

# Prisma logs
npx prisma studio

# Database logs
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"
```

### Useful Commands
```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View database schema
npx prisma db pull

# Format Prisma schema
npx prisma format

# Generate types
npx prisma generate
```

### Documentation Links
- [Bucket 3 Complete Guide](./BUCKET-3-MEETINGS-RSVP-COMPLETE.md)
- [NextAuth Docs](https://next-auth.js.org/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Resend Docs](https://resend.com/docs)
- [Vercel Cron Docs](https://vercel.com/docs/cron-jobs)

---

**Happy Testing! 🎉**

If you encounter any issues not covered here, check the main documentation at `BUCKET-3-MEETINGS-RSVP-COMPLETE.md` or inspect the browser console and server logs for detailed error messages.
