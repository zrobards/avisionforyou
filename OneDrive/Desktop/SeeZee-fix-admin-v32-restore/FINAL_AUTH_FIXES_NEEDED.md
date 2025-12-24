# Final Auth System Fixes

## 1. ✅ Password Reset Email Not Sending - QUICK FIX

### Problem
Resend API configuration is missing from `.env.local`

### Solution
Add these two lines to your `.env.local` file:

```env
RESEND_API_KEY=re_9twxr144_L2ivtd4jBx1paEcKAQ8KuRAn
RESEND_FROM_EMAIL=noreply@seezee.studio
```

Then restart your dev server:
```bash
# Press Ctrl+C to stop
npm run dev
```

### Test It
1. Go to http://localhost:3000/forgot-password
2. Enter your email
3. Check your inbox for the reset code email

---

## 2. 🎨 UI Color Theme - Change from Purple to Trinity Cyan/Red

### Files to Update
I'll change the purple gradient colors to match your Trinity branding:
- `/set-password` page
- `/reset-password` page  
- `/forgot-password` page

### Color Changes
**Current (Purple):**
- `from-purple-500 to-blue-500`
- `bg-purple-500`
- `text-purple-400`

**New (Trinity Theme):**
- `from-cyan-500 to-blue-600` (matches your existing dashboard)
- `bg-trinity-red` or `bg-cyan-500`
- `text-cyan-400`

---

## 3. 🔐 2FA with Authenticator App (TOTP)

### What You Want
- Use authenticator apps like Google Authenticator, Authy, Microsoft Authenticator
- User scans QR code to add account
- On login, user enters 6-digit code from their app
- Code changes every 30 seconds

### Implementation Plan
1. **Setup Page** (`/settings/security/2fa-setup`)
   - Generate secret key
   - Show QR code for user to scan
   - User enters code to verify setup
   - Store encrypted secret in database

2. **Login Flow**
   - After password/OAuth, check if 2FA enabled
   - Redirect to `/2fa-verify` page
   - User enters current 6-digit code from app
   - Verify code matches
   - Complete login

3. **Database Changes**
   - Add `twofa_secret` field to User table (encrypted)
   - Add `twofa_enabled` field (boolean) - already exists!
   - Add `twofa_backup_codes` field (array of one-time backup codes)

4. **NPM Packages Needed**
   ```bash
   npm install otpauth qrcode
   npm install --save-dev @types/qrcode
   ```

### Security Features
- ✅ Secret key encrypted in database
- ✅ Backup codes for account recovery (10 one-time codes)
- ✅ Rate limiting on verification attempts
- ✅ Can disable 2FA with password + backup code
- ✅ Audit log of 2FA events

---

## Priority Order

1. **IMMEDIATE:** Add Resend config to `.env.local` (2 minutes)
2. **QUICK:** Update UI colors to Trinity theme (15 minutes)
3. **FEATURE:** Implement TOTP 2FA (1-2 hours)

---

## Questions for You

### For 2FA Implementation:
1. Should 2FA be **optional** or **required** for certain roles (CEO, ADMIN)?
2. Should users get 10 backup codes when enabling 2FA?
3. Should there be a "Trust this device for 30 days" option?
4. Where should the 2FA setup be? (Settings > Security tab?)

Let me know your preferences and I'll implement accordingly!







