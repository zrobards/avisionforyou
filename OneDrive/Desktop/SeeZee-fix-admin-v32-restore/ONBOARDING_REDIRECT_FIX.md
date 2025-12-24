# Onboarding Redirect Fix - Part 2

## Problem
After fixing the authentication issue, users were able to log in successfully but were NOT being redirected to the Terms of Service page. Instead, they landed on the home page with no prompts to complete onboarding.

## Root Cause

### The Middleware Doesn't Run on Home Page
The middleware configuration only matches specific protected routes:
```typescript
export const config = {
  matcher: [
    '/admin/:path*',
    '/client/:path*',
    '/ceo/:path*',
    '/portal/:path*',
    '/onboarding/:path*',
    '/verify-email',
    '/set-password',
    '/api/((?!auth).*)',
  ],
};
```

**The home page "/" is NOT in this list!**

### What Was Happening:
1. User logs in successfully
2. Login page redirects to `callbackUrl` (defaults to "/")
3. User lands on home page "/"
4. **Middleware never runs** because "/" isn't matched
5. No redirect to onboarding ❌

## Solution

### Fix the Login Redirect Logic
Instead of blindly redirecting to the `callbackUrl`, we now:
1. Fetch the user's session after successful login
2. Check their onboarding status
3. Redirect to the appropriate page based on their status

**File:** `src/app/login/page.tsx`

### Email/Password Login Fix
```typescript
} else {
  // Success - fetch session to check onboarding status
  const sessionRes = await fetch('/api/auth/session');
  const sessionData = await sessionRes.json();
  
  console.log('Login successful, session:', sessionData);
  
  // Determine redirect based on onboarding status
  let redirectUrl = callbackUrl;
  
  if (sessionData?.user) {
    const user = sessionData.user;
    
    // Check onboarding completion
    if (!user.tosAcceptedAt) {
      redirectUrl = '/onboarding/tos';
    } else if (!user.profileDoneAt) {
      redirectUrl = '/onboarding/profile';
    } else if (redirectUrl === '/') {
      // If onboarding is complete and no specific return URL, go to dashboard
      redirectUrl = user.role === 'CEO' || user.role === 'ADMIN' ? '/admin' : '/client';
    }
  }
  
  console.log('Redirecting to:', redirectUrl);
  window.location.href = redirectUrl;
}
```

### Google OAuth Login Fix
```typescript
const handleGoogleLogin = async () => {
  setError("");
  setIsLoading(true);
  try {
    // For OAuth, redirect to onboarding/tos as default
    // Middleware will handle redirects if already completed
    const oauthCallback = callbackUrl === '/' ? '/onboarding/tos' : callbackUrl;
    await signIn("google", { callbackUrl: oauthCallback });
  } catch (err: any) {
    console.error("Sign in exception:", err);
    setError("Failed to initiate login. Please try again.");
    setIsLoading(false);
  }
};
```

### Added Debug Logging to Middleware
**File:** `middleware.ts`

Added logging to track onboarding checks:
```typescript
// Debug logging for onboarding flow
console.log(`🔍 Middleware onboarding check:`, {
  pathname,
  email: token.email,
  tosAccepted,
  profileDone,
  emailVerified: token.emailVerified,
  role: token.role,
});
```

## How It Works Now

### Email/Password Flow:
1. User logs in with email/password ✓
2. Login page fetches session and checks onboarding status
3. Redirects to `/onboarding/tos` if TOS not accepted ✓
4. User accepts TOS
5. Redirects to `/onboarding/profile` ✓
6. User completes profile
7. Redirects to appropriate dashboard ✓

### OAuth Flow:
1. User signs in with Google ✓
2. OAuth callback redirects to `/onboarding/tos` (instead of "/") ✓
3. Middleware checks if onboarding is complete
4. If complete, redirects to dashboard
5. If not, allows access to onboarding pages ✓

### Returning Users:
1. User logs in
2. Login page checks onboarding status
3. If complete, redirects to dashboard based on role ✓
4. If incomplete, redirects to appropriate onboarding step ✓

## Files Changed

### Updated
- `src/app/login/page.tsx` - Added session check and smart redirect logic
- `middleware.ts` - Added debug logging for troubleshooting
- `src/app/signup/page.tsx` - Ensured OAuth redirects to onboarding
- `src/app/register/client/page.tsx` - Ensured OAuth redirects to onboarding

## Testing

### Test Case 1: New Email/Password User
1. Register at `/register` ✓
2. Verify email ✓
3. Log in → Should redirect to `/onboarding/tos` ✓
4. Accept TOS → Should redirect to `/onboarding/profile` ✓
5. Complete profile → Should redirect to dashboard ✓

### Test Case 2: New OAuth User
1. Sign in with Google ✓
2. Should redirect to `/onboarding/tos` ✓
3. Accept TOS → Should redirect to `/onboarding/profile` ✓
4. Complete profile → Should redirect to dashboard ✓

### Test Case 3: Returning User
1. Log in ✓
2. Should redirect directly to dashboard ✓
3. Should NOT see onboarding pages ✓

### Test Case 4: Returning User with Specific Return URL
1. Try to access `/client/projects` while logged out
2. Middleware captures returnUrl
3. Log in → Should redirect to `/client/projects` ✓

## Result
✅ Users are now properly redirected to onboarding after login
✅ No more landing on home page without completing onboarding
✅ Smart redirect logic handles all cases
✅ Debug logging helps troubleshoot issues








