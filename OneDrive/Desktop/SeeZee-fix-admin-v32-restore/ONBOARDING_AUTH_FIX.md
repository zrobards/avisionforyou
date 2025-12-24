# Onboarding Authentication Fix

## Problem
Users were receiving a 401 (Unauthorized) error when accepting Terms of Service during onboarding. The root cause was that users registering via email/password were being redirected to onboarding pages without being logged in.

## Root Cause Analysis

### Email/Password Registration Flow (BROKEN)
1. User registers → Account created, NOT logged in
2. User clicks verification link → Email verified
3. API redirected to `/onboarding/tos` → **No session available**
4. TOS page tried to call API → **401 Unauthorized**

### OAuth Registration Flow (WORKING)
1. User signs in with Google → Automatically logged in
2. Redirected to `/onboarding/tos` → Session available ✓
3. Can proceed through onboarding → Works correctly ✓

## Fixes Implemented

### 1. Fixed Email Verification Redirect Flow
**File:** `src/app/api/auth/verify-email/route.ts`

**Before:**
```typescript
redirectUrl: user.tosAcceptedAt && user.profileDoneAt
  ? dashboardUrl
  : user.tosAcceptedAt
  ? "/onboarding/profile"
  : "/onboarding/tos",
```

**After:**
```typescript
// After verification, redirect to login
// Middleware will handle redirecting to appropriate onboarding step after login
redirectUrl: "/login",
```

**Reason:** Users must log in after email verification to establish a session. The middleware will then redirect them to the correct onboarding step.

### 2. Added Session Status Checks to Onboarding Pages
**Files:** 
- `src/app/onboarding/tos/page.tsx`
- `src/app/onboarding/profile/page.tsx`

**Changes:**
- Added `status` from `useSession()` hook
- Show loading spinner while session is being fetched
- Redirect to login if unauthenticated
- Prevent API calls when no session exists

```typescript
const { data: session, status, update } = useSession();

// Show loading state while session is being fetched
if (status === "loading") {
  return <LoadingSpinner />;
}

// If not authenticated, redirect to login
if (status === "unauthenticated" || !session?.user?.id) {
  window.location.href = "/login?returnUrl=/onboarding/tos";
  return null;
}
```

### 3. Added `credentials: "include"` to API Calls
**Files:**
- `src/app/onboarding/tos/page.tsx`
- `src/app/onboarding/profile/page.tsx`

**Changes:**
```typescript
const response = await fetch("/api/onboarding/tos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // ← Ensures cookies are sent
  body: JSON.stringify({ accepted: true }),
});
```

### 4. Enhanced API Route Debugging
**Files:**
- `src/app/api/onboarding/tos/route.ts`
- `src/app/api/onboarding/profile/route.ts`

**Changes:**
- Changed from `Request` to `NextRequest` for better cookie handling
- Added detailed logging to track session issues
- Better error messages

```typescript
console.log("TOS API: Session check", { 
  hasSession: !!session, 
  hasUser: !!session?.user,
  userId: session?.user?.id,
  userEmail: session?.user?.email,
  cookies: req.cookies.getAll().map(c => c.name),
});
```

### 5. Updated Verification Success Message
**File:** `src/app/verify-email/[token]/page.tsx`

**Changes:**
- Updated UI to clarify that users need to log in
- Changed button text from "Continue" to "Continue to Login"

## Testing the Fix

### For New Users (Email/Password):
1. Register at `/register` or `/signup`
2. Check email for verification link
3. Click verification link → Redirected to `/login` ✓
4. Log in with credentials
5. Automatically redirected to `/onboarding/tos` ✓
6. Accept ToS → Should work without 401 error ✓
7. Complete profile → Redirected to dashboard ✓

### For New Users (OAuth):
1. Sign up with Google
2. Automatically logged in and redirected to `/onboarding/tos` ✓
3. Accept ToS → Should work ✓
4. Complete profile → Redirected to dashboard ✓

### For Returning Users:
1. Log in normally
2. Middleware checks onboarding completion
3. Redirects to appropriate step if incomplete

## Additional Improvements

### Session Loading States
All onboarding pages now properly handle the three session states:
- `loading`: Show spinner
- `authenticated`: Proceed normally
- `unauthenticated`: Redirect to login

### Better Error Messages
- Client-side: Alert users if session is missing
- Server-side: Detailed logs for debugging
- UI: Clear messaging about login requirements

### Cookie Handling
- Explicit `credentials: "include"` on all API calls
- Using `NextRequest` type for proper cookie access
- Logging cookie names for debugging

## Files Changed

### API Routes
- `src/app/api/auth/verify-email/route.ts`
- `src/app/api/onboarding/tos/route.ts`
- `src/app/api/onboarding/profile/route.ts`

### Pages
- `src/app/onboarding/tos/page.tsx`
- `src/app/onboarding/profile/page.tsx`
- `src/app/verify-email/[token]/page.tsx`

## Result
✅ Email/password registration now works correctly
✅ OAuth registration continues to work
✅ All onboarding flows properly handle authentication
✅ Better error messages for debugging
✅ Proper loading states for better UX









