# Environment Setup - Fix Authentication Issues

## Critical Fix for "Configuration" Error

The "Configuration" error when logging in is caused by missing environment variables. You need to create a `.env.local` file in your project root with the following variables:

### Required Variables

Create a file named `.env.local` in the root directory with these contents:

```env
# Authentication - REQUIRED
AUTH_SECRET=dev-secret-key-change-in-production
NEXTAUTH_SECRET=dev-secret-key-change-in-production

# Application URL - REQUIRED (this fixes the Configuration error!)
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Google OAuth - Add your credentials
AUTH_GOOGLE_ID=your-google-client-id-here
AUTH_GOOGLE_SECRET=your-google-client-secret-here
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Database - Add your database URL
DATABASE_URL=your-database-url-here

# ReCAPTCHA - Optional but recommended
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

# Other variables (copy from your existing env file)
# ... add any other environment variables you have
```

### Quick Fix Instructions

1. **Create `.env.local` file** in the root directory
2. **Copy the template above** and fill in your actual values
3. **Restart your development server** (stop with Ctrl+C and run `npm run dev` again)
4. **Try logging in again** - the Configuration error should be gone

### What This Fixes

✅ **Configuration Error** - Adding `AUTH_URL` and `NEXTAUTH_URL` fixes the authentication configuration error  
✅ **Onboarding Redirect Loop** - CEO users (seanspm1007@gmail.com) will now skip onboarding automatically  
✅ **Login Redirect** - After successful login, you'll be redirected to the correct dashboard based on your onboarding status

### Testing

After setting up the environment variables:

1. Log in with `seanspm1007@gmail.com`
2. You should be redirected directly to `/admin` (skipping onboarding)
3. No more "Configuration" error
4. No more brief redirect to onboarding/tos page

### Notes

- The `.env.local` file is gitignored and won't be committed
- For production, replace `http://localhost:3000` with your actual domain (e.g., `https://see-zee.com`)
- For production, generate a secure `AUTH_SECRET` using: `openssl rand -base64 32`


