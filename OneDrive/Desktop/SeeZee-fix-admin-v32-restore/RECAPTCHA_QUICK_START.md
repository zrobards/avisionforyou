# reCAPTCHA Quick Start 🚀

## Step 1: Add Environment Variables

Open your `.env` file and add these two lines:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Le0CTAsAAAAAHRmoCSqCYXNgPoJ7qzqKj6MY8Ay
RECAPTCHA_SECRET_KEY=6Le0CTAsAAAAAFlFKl8AJZ07xW7LIRyEZWAGvmrU
```

## Step 2: Restart Dev Server

```bash
# Stop your current dev server (Ctrl+C)
# Then restart it:
npm run dev
```

## Step 3: Test It Out

1. Visit `http://localhost:3000/login` or `http://localhost:3000/register`
2. Open browser console (F12)
3. Click the login/register button
4. You should see: `✅ reCAPTCHA token generated for [action]`

## That's It! ✨

Your site is now protected by reCAPTCHA v3. The integration is:
- ✅ Invisible (no checkboxes)
- ✅ Automatic (runs in background)
- ✅ Secure (protects login & registration)

---

## Need More Info?

Check `RECAPTCHA_SETUP.md` for detailed documentation, troubleshooting, and advanced configuration.

## Production Deployment

When deploying to production:
1. Add both environment variables to your hosting platform (Vercel, Netlify, etc.)
2. In Google reCAPTCHA admin console, add your production domain
3. That's it!

---

**Ready to go!** 🎉










