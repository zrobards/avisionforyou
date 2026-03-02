# A Vision For You

Full-stack web application for **A Vision For You**, a 501(c)(3) nonprofit providing addiction recovery, safe housing, and community support in Louisville, Kentucky.

**EIN:** 87-1066569 | **Website:** [avisionforyou.org](https://avisionforyou.org)

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Database:** PostgreSQL (Neon) via Prisma ORM
- **Auth:** NextAuth with Google OAuth + email/password
- **Payments:** Square (donations + DUI class registrations)
- **Email:** Resend (transactional emails, reminders, receipts)
- **Analytics:** Google Analytics 4 + Vercel Analytics
- **Monitoring:** Sentry (error tracking + source maps)
- **Rate Limiting:** Upstash Redis
- **Styling:** Tailwind CSS
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (recommend [Neon](https://neon.tech))
- npm

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Fill in all required values in .env.local

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

### Environment Variables

See `.env.example` for the full list. At minimum you need:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | App URL (http://localhost:3000 for dev) |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `SQUARE_ACCESS_TOKEN` | Yes | Square payments API token |
| `SQUARE_LOCATION_ID` | Yes | Square location ID |
| `SQUARE_ENVIRONMENT` | Yes | `sandbox` or `production` |
| `RESEND_API_KEY` | Yes | Resend email service API key |
| `ADMIN_EMAIL` | Yes | Admin notification email |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Recommended | Google Analytics 4 ID |
| `ENCRYPTION_KEY` | Production | AES-256 key for PHI encryption |
| `UPSTASH_REDIS_REST_URL` | Recommended | Upstash Redis for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Recommended | Upstash Redis token |
| `SENTRY_DSN` | Recommended | Sentry error tracking DSN |
| `CRON_SECRET` | Recommended | Secret for cron endpoints |

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run Playwright E2E tests
npm run analyze      # Bundle size analysis
```

## Project Structure

```
src/
  app/                  # Next.js App Router pages
    admin/              # Admin dashboard (analytics, blog, donations, etc.)
    api/                # API routes
    board/              # Board member portal
    community/          # Alumni community features
    home/               # Homepage data constants
  components/
    analytics/          # Google Analytics integration
    home/               # Homepage sub-components
    layout/             # Navbar, Footer, Sidebar
    shared/             # Reusable UI (SocialShareButtons, Newsletter, etc.)
    ui/                 # Base UI primitives
  lib/                  # Utilities (auth, db, email, validation, encryption)
  hooks/                # Custom React hooks
  types/                # TypeScript type extensions
prisma/
  schema.prisma         # Database schema
  seed.ts               # Database seeder
e2e/                    # Playwright E2E tests
```

## Key Features

- **Programs:** 6 comprehensive recovery programs with detail pages
- **Donations:** Square-integrated one-time and recurring donations
- **Assessment:** Recovery program matching questionnaire
- **Blog:** Content management with Wix migration support
- **Newsletter:** Subscription management with branded email templates
- **Admin Dashboard:** Analytics, user management, content management
- **Board Portal:** Updates, documents, campaigns, meeting minutes
- **Community:** Announcements, polls, resources for alumni
- **DUI Classes:** Registration and payment processing
- **Impact Tracking:** Real-time metrics dashboard with program outcomes

## Security

- HIPAA-aware encryption (AES-256-GCM) for PHI
- Zod validation on all inputs
- Rate limiting via Upstash Redis
- CSRF origin validation
- CSP, HSTS, and security headers
- Audit logging for sensitive operations

## Deployment

Deployed on Vercel. Push to `main` triggers automatic deployment.

```bash
git push origin main
```

Vercel will run `prisma generate && prisma migrate deploy && next build` automatically.
