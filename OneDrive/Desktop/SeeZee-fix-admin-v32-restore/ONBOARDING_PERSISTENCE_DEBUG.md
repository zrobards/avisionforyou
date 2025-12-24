# Onboarding Persistence Debug Guide

## Problem
Users have to go through TOS and Profile setup every time they log in, even after completing it once.

## Debug Logging Added

### What to Look For in Console/Terminal:

#### 1. When Accepting TOS:
```
✅ TOS API: User updated successfully
{
  userId: "...",
  email: "...",
  tosAcceptedAt: "2025-12-20...",  ← Should have a date!
  profileDoneAt: null or "2025-12-20..."
}
```

#### 2. When Session Updates (after TOS):
```
🔑 JWT callback triggered: { 
  hasUser: false, 
  trigger: "update",  ← Should be "update"
  email: "...",
  currentTosAccepted: false → true,  ← Should change to true
}
```

#### 3. When Logging In Again:
```
🔑 JWT callback triggered: { 
  hasUser: true,  ← Should be true on fresh login
  trigger: undefined,
  email: "...",
}

🔑 JWT: Updated token from DB
{
  email: "...",
  tosAccepted: true,  ← Should be true!
  profileDone: true,  ← Should be true after profile complete!
  dbUser: {
    tosAcceptedAt: "2025-12-20...",  ← Should have dates!
    profileDoneAt: "2025-12-20...",
  }
}
```

#### 4. When Login Page Checks Session:
```
Onboarding status check: {
  tosAcceptedAt: "1",  ← Should be "1" if completed
  profileDoneAt: "1",  ← Should be "1" if completed
  role: "CLIENT",
  hasTos: true,  ← Should be true
  hasProfile: true,  ← Should be true
}

→ Onboarding complete, redirecting to dashboard
```

## Test Steps

### Step 1: Accept TOS
1. Log in with a fresh account
2. Get redirected to `/onboarding/tos`
3. Accept TOS
4. **CHECK TERMINAL** for "✅ TOS API: User updated successfully"
   - Verify `tosAcceptedAt` has a date value
5. **CHECK BROWSER CONSOLE** for "🔑 JWT callback triggered" with `trigger: "update"`
6. Get redirected to `/onboarding/profile`

### Step 2: Complete Profile
1. Fill out profile form
2. Submit
3. Get redirected to dashboard

### Step 3: Log Out and Back In
1. Log out
2. Log back in
3. **CHECK BROWSER CONSOLE** for "Onboarding status check"
   - `tosAcceptedAt` should be "1"
   - `profileDoneAt` should be "1"
   - Should see "→ Onboarding complete, redirecting to dashboard"
4. **SHOULD GO STRAIGHT TO DASHBOARD** ← This is the test!

## Possible Issues

### Issue A: Database Not Updating
**Symptom:** Terminal shows `tosAcceptedAt: null` after accepting TOS

**Solution:** Check database connection, check Prisma client

### Issue B: JWT Not Refreshing on Login
**Symptom:** 
- Database has dates
- But JWT callback shows `tosAccepted: false`

**Solution:** Check JWT callback is fetching from DB correctly

### Issue C: Session Update Not Working
**Symptom:** 
- TOS accepted
- JWT callback never called with `trigger: "update"`

**Solution:** Check if `session.update()` is working properly

### Issue D: Session Format Wrong
**Symptom:**
- JWT has `tosAccepted: true`
- But session has `tosAcceptedAt: null`

**Solution:** Check session callback mapping (line 347 in auth.ts)

## Quick Fix Commands

### Check Database Directly:
```sql
SELECT email, tosAcceptedAt, profileDoneAt, role 
FROM User 
WHERE email = 'your-email@example.com';
```

### Clear Session and Try Again:
1. Clear browser cookies for localhost:3000
2. Log out
3. Log in fresh

## Files with Debug Logging

- `src/auth.ts` (Lines 345-403) - JWT and session callbacks
- `src/app/api/onboarding/tos/route.ts` (Lines 33-48) - TOS acceptance
- `src/app/login/page.tsx` (Lines 88-114) - Login redirect logic
- `middleware.ts` (Lines 94-115) - Middleware onboarding checks







