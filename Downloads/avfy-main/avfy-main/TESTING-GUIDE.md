# Testing Guide - Unified Scheduler System

## Quick Start

### 1. Generate Prisma Client & Start Server
```bash
# Stop any running dev servers first
# Then run:
npx prisma generate
npm run dev
```

### 2. Open Browser
Navigate to: `http://localhost:3000`

---

## Test Scenarios

### 🔓 As a Guest (Not Logged In)

#### Test: View Sessions Page
1. Go to `/meetings`
2. ✅ Should see both free sessions and DUI classes
3. ✅ Filter tabs should work (All, Free, Paid)
4. ✅ Free sessions should show "Sign In to RSVP" button
5. ✅ DUI classes should show "Register & Pay" link
6. ✅ Should see capacity/spots remaining

#### Test: Navigation
1. Check navbar
2. ✅ Should see "Sessions" link
3. ✅ Should NOT see role-based portal links
4. ✅ Should see "Sign In" button

---

### 👤 As a Regular User (USER role)

#### Test: View Sessions
1. Login as regular user
2. Go to `/meetings`
3. ✅ Should see RSVP buttons for free sessions
4. ✅ Should see "Register & Pay" for DUI classes

#### Test: RSVP to Free Session
1. Click "RSVP Now" on a free session
2. ✅ Button should change to "Cancel RSVP"
3. ✅ Should see confirmation
4. Go to `/dashboard`
5. ✅ Session should appear in "My Upcoming Sessions"

#### Test: Dashboard
1. Go to `/dashboard`
2. ✅ Should see welcome message with your name
3. ✅ Should see "My Upcoming Sessions" section
4. ✅ Should see "Recent Donations" section
5. ✅ Should see "Quick Actions" grid
6. ✅ Should NOT see role-based portal cards

---

### 🎓 As Alumni (ALUMNI role)

#### Test: Community Access
1. Login as alumni user
2. ✅ Should see "Community" link in navbar
3. Go to `/community`
4. ✅ Should see community dashboard
5. ✅ Should see "My Upcoming Sessions"
6. ✅ Should see "Announcements"
7. ✅ Should see "Active Polls" sidebar
8. ✅ Should see "Quick Links" sidebar

#### Test: Dashboard Access
1. Go to `/dashboard`
2. ✅ Should see "Community Hub" quick access card
3. ✅ Card should link to `/community`

#### Test: Poll Voting
1. Go to `/community`
2. ✅ Should see active polls in sidebar
3. Click on a poll
4. ✅ Should be able to vote
5. Return to `/community`
6. ✅ Poll should show "You voted"

---

### 📋 As Board Member (BOARD role)

#### Test: Board Portal Access
1. Login as board member
2. ✅ Should see "Board Portal" link in navbar
3. Go to `/dashboard`
4. ✅ Should see "Board Portal" quick access card
5. ✅ Card should link to `/board`

#### Test: Community Access
1. ✅ Should also have community access (if also ALUMNI)
2. ✅ Should see both Board and Community cards

---

### ⚙️ As Admin (ADMIN role)

#### Test: All Portal Access
1. Login as admin
2. ✅ Should see "Board Portal", "Community", and "Admin Panel" links
3. Go to `/dashboard`
4. ✅ Should see all three portal cards:
   - Board Portal (indigo)
   - Community Hub (green)
   - Admin Panel (purple)

#### Test: Create Poll
1. Go to `/admin/community/polls`
2. Click "Create Poll"
3. Enter title: "Test Poll"
4. Enter description: "This is a test"
5. Click "Create"
6. ✅ Poll should be created without error
7. ✅ Should see success message
8. Go to `/community`
9. ✅ New poll should appear in "Active Polls"

#### Test: Manage Sessions
1. Go to `/admin/meetings`
2. ✅ Should be able to create/edit sessions
3. Go to `/meetings`
4. ✅ New sessions should appear

---

## 🐛 Common Issues & Solutions

### Issue: "Prisma generate failed"
**Solution:**
1. Stop dev server (`Ctrl+C`)
2. Close VS Code
3. Run `npx prisma generate` again
4. Restart dev server

### Issue: "Sessions not showing"
**Check:**
1. Are there ProgramSession records in DB?
2. Is `startDate` in the future?
3. Check browser console for errors

### Issue: "DUI classes not showing"
**Check:**
1. Are there DUIClass records in DB?
2. Is `active: true`?
3. Is `date` in the future?

### Issue: "Role-based cards not showing"
**Check:**
1. Is user logged in?
2. Does user have correct role?
3. Check session data in browser DevTools

### Issue: "RSVP not working"
**Check:**
1. Is user logged in?
2. Check browser console for errors
3. Check `/api/rsvp` endpoint response

### Issue: "Poll creation fails"
**Check:**
1. Is user ADMIN?
2. Is title non-empty?
3. Check browser console for error message
4. Check server logs

---

## 🎯 Test Checklist

### Meetings Page
- [ ] Page loads without errors
- [ ] Free sessions display with green border
- [ ] DUI classes display with purple border
- [ ] Filter tabs work (All, Free, Paid)
- [ ] Capacity/spots shown correctly
- [ ] RSVP button works (logged in)
- [ ] "Sign In to RSVP" shows (logged out)
- [ ] "Register & Pay" links work

### Dashboard
- [ ] Welcome message shows user name
- [ ] Role badge displays correctly
- [ ] Role-based cards appear for appropriate roles
- [ ] "My Upcoming Sessions" shows RSVPs
- [ ] "My Upcoming Sessions" shows DUI registrations
- [ ] Recent donations display
- [ ] Application status banner shows
- [ ] Quick actions grid works

### Community Page
- [ ] Requires ALUMNI or ADMIN role
- [ ] Welcome message shows
- [ ] "My Upcoming Sessions" displays
- [ ] Announcements show (latest 3)
- [ ] Active polls display in sidebar
- [ ] "You voted" indicator works
- [ ] Quick links work

### Navigation
- [ ] "Sessions" link in navbar
- [ ] Board Portal link (BOARD/ADMIN only)
- [ ] Community link (ALUMNI/ADMIN only)
- [ ] Admin Panel link (ADMIN/STAFF only)
- [ ] Mobile menu works
- [ ] User dropdown works

### Poll System
- [ ] Admin can create polls
- [ ] Title validation works
- [ ] Polls appear in community dashboard
- [ ] Alumni can vote
- [ ] Vote counts update
- [ ] "You voted" indicator appears

---

## 📊 Test Data Needed

### For Complete Testing, You Need:

1. **Users:**
   - Regular user (USER role)
   - Alumni user (ALUMNI role)
   - Board member (BOARD role)
   - Admin user (ADMIN role)

2. **Program Sessions:**
   - At least 2-3 upcoming sessions
   - With `startDate` in the future
   - With capacity set

3. **DUI Classes:**
   - At least 2-3 upcoming classes
   - With `active: true`
   - With `date` in the future
   - With price and capacity set

4. **Polls:**
   - At least 1-2 active polls
   - With `active: true`

5. **Announcements:**
   - At least 2-3 published announcements
   - With `published: true`

---

## 🚀 Performance Checks

### Page Load Times
- [ ] `/meetings` loads in < 2 seconds
- [ ] `/dashboard` loads in < 2 seconds
- [ ] `/community` loads in < 2 seconds

### RSVP Response Time
- [ ] RSVP action completes in < 1 second
- [ ] UI updates immediately
- [ ] No page refresh needed

### Filter Performance
- [ ] Filter tabs respond instantly
- [ ] No lag when switching filters

---

## 📱 Mobile Testing

### Responsive Design
- [ ] Navbar collapses on mobile
- [ ] Mobile menu opens/closes smoothly
- [ ] Session cards stack vertically
- [ ] Buttons are touch-friendly
- [ ] Text is readable on small screens

### Touch Interactions
- [ ] RSVP buttons work on touch
- [ ] Filter tabs work on touch
- [ ] Links are easy to tap
- [ ] No accidental double-taps

---

## ✅ Sign-Off Checklist

Before deploying to production:

- [ ] All test scenarios pass
- [ ] No console errors
- [ ] No 404 errors
- [ ] All links work
- [ ] Role-based access works correctly
- [ ] RSVP functionality works
- [ ] Poll creation works
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] Database migrations applied

---

## 🎉 Success Criteria

The implementation is successful if:

1. ✅ Users can view both free sessions and paid DUI classes in one place
2. ✅ Users can filter by session type
3. ✅ Users can RSVP to free sessions
4. ✅ Users can register for DUI classes
5. ✅ Dashboard shows upcoming sessions
6. ✅ Community dashboard shows sessions, polls, and announcements
7. ✅ Role-based portal links appear correctly
8. ✅ Admin can create polls without errors
9. ✅ Mobile experience is smooth
10. ✅ No breaking changes to existing functionality

---

**Happy Testing! 🎊**

If you encounter any issues not covered in this guide, check:
1. Browser console for errors
2. Server logs for backend errors
3. Network tab for failed requests
4. Database for missing data
