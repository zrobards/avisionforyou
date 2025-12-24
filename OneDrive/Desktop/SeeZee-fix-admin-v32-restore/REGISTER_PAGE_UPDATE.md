# Register Page & Staff Invitation System Update

## Overview
Updated the registration flow to use a single branded register page with integrated 6-digit staff invitation code system, and added invite management to the team dashboard.

## Changes Made

### 1. **Updated Register Page** (`/src/app/register/page.tsx`)
   - ✅ Added LogoHeader branding from login page
   - ✅ Modern two-card design with animations (framer-motion)
   - ✅ **Client Card**: Direct Google OAuth sign-up
   - ✅ **Staff Card**: Shows 6-digit code input form
   - ✅ Integrated 6-digit code validation UI
   - ✅ Black background matching login page aesthetic
   - ✅ Proper error handling and loading states

### 2. **Team Management - Invite Staff** (`/src/components/admin/TeamClient.tsx`)
   - ✅ Added "Invite Staff" button in header
   - ✅ Beautiful modal dialog for sending invitations
   - ✅ Form fields:
     - Email input (required)
     - Role selector (CEO, CFO, FRONTEND, BACKEND, OUTREACH)
   - ✅ Sends 6-digit code via email automatically
   - ✅ Success confirmation with auto-close
   - ✅ Error handling with user-friendly messages

### 3. **Login Page** (`/src/app/login/page.tsx`)
   - ✅ Updated "Create one" link to point to `/register` instead of `/signup`

### 4. **CEO Email Whitelist** (`/src/app/api/invitations/code/route.ts`)
   - ✅ Updated to include all CEO emails:
     - `seanspm1007@gmail.com`
     - `seanpm1007@gmail.com`
     - `seezee.enterprises@gmail.com`

## User Flow

### Client Registration
1. User visits `/register`
2. Clicks "Client" card
3. Redirected to Google OAuth
4. After auth, goes to `/onboarding/account-type`
5. Selects "Client" → automatically upgraded to CLIENT role

### Staff Registration (6-Digit Code)
1. **Admin sends invitation**:
   - Go to `/admin/team`
   - Click "Invite Staff" button
   - Enter email and select role
   - 6-digit code emailed automatically
   
2. **Staff member receives email** with:
   - 6-digit code (e.g., "482756")
   - Instructions to visit the site
   
3. **Staff member registers**:
   - Visit `/register`
   - Click "Staff" card
   - See 6-digit code input form
   - Enter code from email
   - Click "Continue with Google"
   - Redirected to Google OAuth
   - After auth, code is verified at `/onboarding/account-type`
   - Automatically upgraded to assigned role (FRONTEND, BACKEND, etc.)

## Security Features
- ✅ Codes are bcrypt hashed (never stored plain text)
- ✅ Max 5 attempts per code
- ✅ 7-day expiration
- ✅ One-time use (marked as redeemed)
- ✅ Email matching (code must be used by invited email)
- ✅ Only CEO can send invitations

## File Structure
```
src/
├── app/
│   ├── login/
│   │   └── page.tsx                    [Updated] Link to /register
│   ├── register/
│   │   ├── page.tsx                    [Updated] Main register page with 6-digit code UI
│   │   ├── client/page.tsx             [Existing] Client-specific registration
│   │   └── staff/page.tsx              [Deprecated] Old token-based staff registration
│   ├── admin/
│   │   └── team/page.tsx               [Existing] Uses TeamClient component
│   ├── api/
│   │   └── invitations/
│   │       └── code/route.ts           [Updated] CEO email whitelist
│   └── onboarding/
│       └── account-type/page.tsx       [Existing] Handles code verification
└── components/
    └── admin/
        └── TeamClient.tsx              [Updated] Added invite modal
```

## Testing Checklist

### As Admin (CEO)
- [ ] Navigate to `/admin/team`
- [ ] Click "Invite Staff" button
- [ ] Modal opens with form
- [ ] Fill in email and select role
- [ ] Click "Send Invitation"
- [ ] See success message
- [ ] Check that email was received

### As New Staff Member
- [ ] Receive invitation email with 6-digit code
- [ ] Navigate to `/register`
- [ ] Click "Staff" card
- [ ] See 6-digit code input (6 boxes)
- [ ] Enter code from email
- [ ] Click "Continue with Google"
- [ ] Complete Google OAuth
- [ ] Get redirected to account type selection
- [ ] Code automatically verified
- [ ] Role assigned correctly

### As New Client
- [ ] Navigate to `/register`
- [ ] Click "Client" card
- [ ] Redirected directly to Google OAuth
- [ ] After auth, go to onboarding
- [ ] Select "Client" account type
- [ ] Access client portal

## Next Steps (Optional Enhancements)

1. **Active Invitations List**
   - Add a table below team members showing pending invitations
   - Show email, role, expiration date, attempts used
   - Add "Resend" and "Revoke" buttons

2. **Invitation Analytics**
   - Track invitation success rate
   - Show days until expiration
   - Alert when invitations are about to expire

3. **Bulk Invitations**
   - Upload CSV of emails
   - Send multiple invitations at once

4. **Custom Expiration**
   - Allow admin to set custom expiration (1-30 days)
   - Show expiration time in invitation email

## Notes
- The old `/register/staff` page with token-based invitations is deprecated but still exists
- All new staff invitations should use the 6-digit code system
- The register page is now the primary entry point for all new users
- Login and register pages share consistent branding (LogoHeader, black background)











