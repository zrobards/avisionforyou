# Email Sending Fix - Resend Domain Verification

## Problem
Emails are not being sent to CEO accounts and project accounts. The issue is likely due to:
1. **Domain not verified in Resend** - The "from" email address domain must be verified in Resend
2. **Inconsistent "from" addresses** - Different parts of the code were using different email addresses

## What Was Fixed

### 1. Consistent "From" Email Address
**File:** `src/lib/email/send.ts`

**Before:**
```typescript
const from = options.from || "SeeZee Studio <noreply@see-zee.com>";
```

**After:**
```typescript
const defaultFrom = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const from = options.from || `SeeZee Studio <${defaultFrom}>`;
```

Now all emails will use:
- `RESEND_FROM_EMAIL` environment variable if set
- Fallback to `onboarding@resend.dev` (Resend's verified test domain) if not set

### 2. Better Error Logging
Added detailed error logging that will help identify:
- Domain verification errors
- API key issues
- Specific Resend API errors

### 3. Helpful Error Messages
When domain verification fails, you'll now see a clear message:
```
Email sending failed: Domain verification required. Please verify the domain in Resend dashboard or use a verified email address.
```

## How to Fix Email Sending

### Option 1: Use Resend's Test Domain (Quick Fix)
This works immediately without any setup:

1. **Set environment variable** (in `.env.local` or Vercel):
   ```env
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```

2. **Restart your server** (if running locally)

3. **Test email sending** - Should work immediately!

**Note:** Emails will come from `onboarding@resend.dev` which is fine for testing, but not ideal for production.

### Option 2: Verify Your Domain in Resend (Production Fix)

1. **Go to Resend Dashboard**
   - Visit: https://resend.com/domains
   - Sign in with your Resend account

2. **Add Your Domain**
   - Click "Add Domain"
   - Enter: `see-zee.com` (or `seezee.studio`)
   - Click "Add"

3. **Verify Domain Ownership**
   Resend will provide DNS records to add:
   - **DKIM records** (for email authentication)
   - **SPF record** (for sender verification)
   - **DMARC record** (optional, but recommended)

4. **Add DNS Records**
   - Go to your domain registrar (where you bought `see-zee.com`)
   - Add the DNS records provided by Resend
   - Wait for DNS propagation (usually 5-60 minutes)

5. **Verify in Resend**
   - Go back to Resend dashboard
   - Click "Verify" next to your domain
   - Wait for verification (can take up to 24 hours, usually much faster)

6. **Update Environment Variable**
   ```env
   RESEND_FROM_EMAIL=noreply@see-zee.com
   ```
   Or:
   ```env
   RESEND_FROM_EMAIL=noreply@seezee.studio
   ```

7. **Restart Server**
   - If local: Restart dev server
   - If Vercel: Redeploy or wait for auto-deploy

## Testing Email Sending

### Test CEO Account Email
1. Go to `/admin/team`
2. Click "Invite Staff"
3. Enter a CEO email: `seanspm1007@gmail.com` or `seanpm1007@gmail.com`
4. Select role: `CEO`
5. Click "Send Invitation"

**Check:**
- ✅ Console should show: `[EMAIL SEND] ✅ Email sent successfully`
- ✅ Check email inbox
- ✅ Check Resend dashboard: https://resend.com/emails

### Test Project Account Email
1. Submit a project inquiry at `/contact` or lead form
2. Complete the form with a project account email
3. Submit

**Check:**
- ✅ Welcome email should be sent
- ✅ Check email inbox
- ✅ Check Resend dashboard

## Troubleshooting

### Error: "Domain verification required"
**Solution:** Use Option 1 (test domain) or verify your domain (Option 2)

### Error: "RESEND_API_KEY environment variable is not set"
**Solution:** 
1. Check your `.env.local` file (local) or Vercel environment variables (production)
2. Make sure `RESEND_API_KEY` is set
3. Restart server after adding

### Emails not arriving
**Check:**
1. **Resend Dashboard** - https://resend.com/emails
   - See if email was sent
   - Check status (Delivered, Bounced, etc.)
   - Check error messages

2. **Spam Folder** - Check recipient's spam folder

3. **Email Address** - Make sure the "to" address is correct

4. **Rate Limiting** - Check if you've hit Resend's rate limits
   - Free tier: 3,000 emails/month
   - Check: https://resend.com/limits

### CEO Emails Not Working
**Check:**
1. CEO emails are: `seanspm1007@gmail.com`, `seanpm1007@gmail.com`, `seezee.enterprises@gmail.com`
2. These should work the same as any other email
3. If they're not working, it's likely a domain verification issue, not a CEO-specific issue

## Current Configuration

### Environment Variables Needed
```env
# Required
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Optional (defaults to onboarding@resend.dev if not set)
RESEND_FROM_EMAIL=noreply@see-zee.com
```

### Files Modified
- ✅ `src/lib/email/send.ts` - Fixed default "from" address and error handling
- ✅ All email sending now uses consistent "from" address

## Next Steps

1. **Immediate Fix:** Set `RESEND_FROM_EMAIL=onboarding@resend.dev` to get emails working now
2. **Production Fix:** Verify your domain in Resend and use `noreply@see-zee.com`
3. **Test:** Send test emails to CEO and project accounts
4. **Monitor:** Check Resend dashboard for delivery status

## Support

If emails still don't work after following these steps:
1. Check Resend dashboard for specific error messages
2. Check server logs for `[EMAIL SEND]` messages
3. Verify `RESEND_API_KEY` is correct and active
4. Check Resend account status and limits



