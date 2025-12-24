# reCAPTCHA Integration Setup Guide

## Overview
This project now includes Google reCAPTCHA v3 integration to protect authentication flows from bots and abuse.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# reCAPTCHA v3 Keys
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Le0CTAsAAAAAHRmoCSqCYXNgPoJ7qzqKj6MY8Ay
RECAPTCHA_SECRET_KEY=6Le0CTAsAAAAAFlFKl8AJZ07xW7LIRyEZWAGvmrU
```

### Key Breakdown:

- **NEXT_PUBLIC_RECAPTCHA_SITE_KEY**: Public key used in the browser (client-side)
- **RECAPTCHA_SECRET_KEY**: Private key used on the server for verification (keep secret!)

⚠️ **Important**: The `NEXT_PUBLIC_` prefix makes the site key available to the browser. Never prefix the secret key with `NEXT_PUBLIC_`.

## What's Been Integrated

### 1. Client-Side Protection
reCAPTCHA is now active on:
- ✅ Login page (`/login`)
- ✅ Registration page (`/register`)

### 2. How It Works
- **Invisible reCAPTCHA v3**: Runs in the background without user interaction
- **Score-based**: Returns a score from 0.0 (bot) to 1.0 (human)
- **Non-intrusive**: No "I'm not a robot" checkboxes needed

### 3. Files Modified/Created

#### New Files:
- `src/components/providers/RecaptchaProvider.tsx` - Client-side reCAPTCHA wrapper
- `src/lib/recaptcha.ts` - Server-side verification utility
- `RECAPTCHA_SETUP.md` - This documentation

#### Modified Files:
- `src/app/providers.tsx` - Added RecaptchaProvider
- `src/app/login/page.tsx` - Added reCAPTCHA execution on login
- `src/app/register/page.tsx` - Added reCAPTCHA execution on registration

## Testing reCAPTCHA

### Development Testing:
1. Add the environment variables to your `.env` file
2. Restart your dev server: `npm run dev`
3. Visit `/login` or `/register`
4. Open browser console - you should see: `✅ reCAPTCHA token generated for [action]`

### Checking reCAPTCHA Status:
- Visit: https://www.google.com/recaptcha/admin
- View your site's analytics and verification scores
- Monitor suspicious activity

## Server-Side Verification (Optional Enhancement)

To add server-side verification to your auth flow:

```typescript
// Example: In your API route
import { verifyRecaptcha } from "@/lib/recaptcha";

export async function POST(req: Request) {
  const { recaptchaToken } = await req.json();
  
  // Verify the token
  const verification = await verifyRecaptcha(recaptchaToken);
  
  if (!verification.success) {
    return Response.json(
      { error: "reCAPTCHA verification failed" },
      { status: 400 }
    );
  }
  
  // Proceed with your logic...
}
```

## Adjusting reCAPTCHA Sensitivity

In `src/lib/recaptcha.ts`, you can adjust the score threshold:

```typescript
// Current threshold: 0.5
if (score < 0.5) {
  return { success: false, score, error: "Suspicious activity detected" };
}
```

**Score Guidelines:**
- `0.9 - 1.0`: Very likely a human
- `0.7 - 0.8`: Probably a human
- `0.5 - 0.6`: Uncertain (default threshold)
- `0.3 - 0.4`: Likely a bot
- `0.0 - 0.2`: Very likely a bot

Lower the threshold for stricter security (more false positives).
Raise the threshold for looser security (fewer false positives).

## Production Deployment

### Vercel / Netlify / Other Platforms:
1. Add the environment variables in your hosting platform's dashboard
2. Ensure `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is accessible to the client
3. Ensure `RECAPTCHA_SECRET_KEY` is server-only (no public access)

### Domain Verification:
- In Google reCAPTCHA admin, ensure your production domain is added to the allowed domains list
- Example: `see-zee.com`, `www.see-zee.com`

## Troubleshooting

### "reCAPTCHA not configured" warning
- **Cause**: Missing `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- **Fix**: Add the site key to your `.env` file and restart the dev server

### reCAPTCHA badge showing in corner
- This is normal for reCAPTCHA v3
- To hide it (optional), add to your CSS:
```css
.grecaptcha-badge { 
  visibility: hidden;
}
```
⚠️ If you hide the badge, you must include reCAPTCHA terms in your privacy policy.

### "reCAPTCHA verification failed" error
- **Cause**: Invalid secret key or network issue
- **Fix**: 
  1. Verify `RECAPTCHA_SECRET_KEY` is correct
  2. Check server logs for detailed error messages
  3. Ensure server can reach `https://www.google.com/recaptcha/api/siteverify`

## Additional Resources

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [Best Practices](https://developers.google.com/recaptcha/docs/faq)

## Support

If you encounter issues with reCAPTCHA integration, check:
1. Environment variables are set correctly
2. Dev server has been restarted after adding env vars
3. Browser console for any errors
4. Server logs for verification failures

---

**Setup Complete!** 🎉 Your site is now protected by reCAPTCHA v3.









