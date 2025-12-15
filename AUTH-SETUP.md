# Authentication Setup Guide

## Quick Start - Email/Password Login

### Method 1: Use Seed Data (Local Development)
```bash
npm run seed
```
- **Email:** `admin@avisionforyou.org`
- **Password:** `AdminPassword123!`

### Method 2: Create Admin via API (Local & Vercel)
```bash
curl -X POST http://localhost:3000/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "SecurePassword123"
  }'
```

Then go to `/login` and sign in with your credentials.

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Database (Already configured)
DATABASE_URL="your-postgres-url"

# NextAuth Configuration (REQUIRED)
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional - for Google Sign-In)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Provider (Optional - for magic link login)
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@avisionforyou.org"
```

## 1. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output and set it as `NEXTAUTH_SECRET` in your `.env.local`

## 2. Google OAuth Setup (Optional)

### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project: "A Vision For You"
3. Enable APIs:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "A Vision For You Recovery"
   
5. Add Authorized Redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.vercel.app/api/auth/callback/google`
   - `https://avisionforyourecovery.org/api/auth/callback/google`

6. Copy your Client ID and Client Secret to `.env.local`

## 3. Resend Email Setup (Optional)

### Steps:
1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify your domain (or use their test domain for development)
4. Go to "API Keys" and create a new key
5. Copy the API key to `.env.local` as `RESEND_API_KEY`

### Email Magic Links:
Once configured, users can sign in by entering their email. They'll receive a magic link to log in without a password.

## 4. Production Deployment (Vercel)

### Add Environment Variables in Vercel:
1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project (avisionforyou)
3. Navigate to "Settings" → "Environment Variables"
4. Add the following variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXTAUTH_SECRET` | (same as .env.local) | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://avisionforyou.vercel.app` | Production |
| `DATABASE_URL` | (your Neon PostgreSQL URL) | All |
| `GOOGLE_CLIENT_ID` | (from Google Cloud Console) | All |
| `GOOGLE_CLIENT_SECRET` | (from Google Cloud Console) | All |
| `RESEND_API_KEY` | (from resend.com) | All |

5. Deploy after adding variables:
```bash
git push origin main
```

### Verify Google OAuth is Working:
1. Visit: https://avisionforyou.vercel.app/login
2. Look for "Sign in with Google" button
3. Click it and verify Google OAuth flow works
4. Check that redirects to https://avisionforyou.vercel.app/api/auth/callback/google

### If Google OAuth Not Showing:
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in Vercel
- Verify redirect URI in Google Cloud Console includes: `https://avisionforyou.vercel.app/api/auth/callback/google`
- Wait 2-5 minutes for Vercel to rebuild with new environment variables
- Clear browser cache and try again

## Authentication Methods

### ✅ Password Login (Always Available)
- Email + Password
- No API keys needed
- Create users at `/setup-admin`

### ✅ Google OAuth (Requires Google API keys)
- "Sign in with Google" button
- Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### ✅ Email Magic Link (Requires Resend API key)
- Passwordless login via email
- Requires `RESEND_API_KEY`

## Troubleshooting

### Admin login not working?
1. Visit `/setup-admin` to create/reset admin user
2. Make sure `DATABASE_URL` is correct
3. Check that you're using the correct password

### Google login not showing?
- ✅ Google OAuth is configured in code (src/lib/auth.ts)
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are in `.env.local` (development)
- For production: add these variables in Vercel dashboard
- Restart your dev server: `npm run dev`
- If still not showing, verify Google credentials are correct

### Google OAuth Error: "redirect_uri_mismatch"?
- Go to Google Cloud Console: https://console.cloud.google.com
- Select your project
- Go to "APIs & Services" → "Credentials" → Select your OAuth app
- Edit and verify "Authorized redirect URIs" includes:
  - `http://localhost:3000/api/auth/callback/google` (for local)
  - `https://avisionforyou.vercel.app/api/auth/callback/google` (for production)
- Save and retry

### Email login not showing?
- Add `RESEND_API_KEY` to `.env.local`
- Restart your dev server

### "Invalid credentials" error?
- User might not exist in database
- Visit `/setup-admin` to create admin user
- Or use `/signup` to create regular user

## Security Notes

- Never commit `.env.local` to git (it's in `.gitignore`)
- Keep your `NEXTAUTH_SECRET` private and random
- Use strong passwords (12+ characters)
- Enable Google OAuth for production for better security
