# Legal Documents Implementation Guide

This guide will help you convert the markdown legal documents into Next.js pages that are accessible at `/privacy`, `/terms`, `/accessibility`, and `/cookies`.

## Current Status

✅ Legal documents created as markdown files in `/legal/` folder:
- `privacy-policy.md`
- `terms-of-service.md`
- `accessibility-statement.md`
- `cookie-policy.md`

✅ Footer updated with legal links (links are ready, pages need to be created)

## Implementation Steps

### Step 1: Create Legal Pages Directory Structure

Create the following directory structure in your Next.js app:

```
src/app/(public)/
  privacy/
    page.tsx
  terms/
    page.tsx
  accessibility/
    page.tsx
  cookies/
    page.tsx
```

### Step 2: Create Privacy Policy Page

Create `src/app/(public)/privacy/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { marked } from 'marked'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'SeeZee Studio Privacy Policy - How we collect, use, and protect your information.',
}

export default async function PrivacyPage() {
  const filePath = join(process.cwd(), 'legal', 'privacy-policy.md')
  const fileContents = await readFile(filePath, 'utf8')
  const htmlContent = await marked(fileContents)

  return (
    <div className="w-full min-h-screen bg-gray-900 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <article 
          className="prose prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  )
}
```

**Alternative (Simpler - No Markdown Parsing):**

If you don't want to install `marked`, you can create a simple React component:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'SeeZee Studio Privacy Policy - How we collect, use, and protect your information.',
}

export default function PrivacyPage() {
  return (
    <div className="w-full min-h-screen bg-gray-900 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <article className="prose prose-invert prose-lg max-w-none text-white">
          <h1 className="text-4xl font-heading font-bold mb-8 text-white">Privacy Policy</h1>
          <p className="text-gray-300 mb-6"><strong>Last updated: December 13, 2024</strong></p>
          
          <p className="text-gray-300 mb-6">
            SeeZee Studio ("SeeZee," "we," "us," or "our") respects your privacy and is committed to protecting the personal information you share with us.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4 text-white">Information We Collect</h2>
          <p className="text-gray-300 mb-4">We may collect the following information when you interact with our website:</p>
          <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
            <li>Name</li>
            <li>Email address</li>
            <li>Organization name</li>
            <li>Messages or project inquiries submitted through forms</li>
            <li>Technical data such as browser type, device information, and pages visited</li>
          </ul>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4 text-white">How We Collect Information</h2>
          <p className="text-gray-300 mb-4">Information is collected when you:</p>
          <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
            <li>Submit a contact or intake form</li>
            <li>Request services or a consultation</li>
            <li>Use or browse our website</li>
          </ul>
          <p className="text-gray-300 mb-6">
            We also collect limited analytics data through Vercel Analytics to understand site performance and usage. This data is aggregated and does not personally identify you.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4 text-white">How We Use Your Information</h2>
          <p className="text-gray-300 mb-4">We use your information to:</p>
          <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
            <li>Respond to inquiries and communicate with you</li>
            <li>Evaluate and manage project requests</li>
            <li>Improve our website and services</li>
            <li>Comply with legal or business obligations</li>
          </ul>
          <p className="text-gray-300 mb-6 font-semibold">
            <strong>We do not sell your personal information.</strong>
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4 text-white">Payments & Third-Party Services</h2>
          <p className="text-gray-300 mb-6">
            Payments referenced on this site may be processed through third-party providers (such as Stripe) and may be handled under a separate affiliated business entity. SeeZee Studio does not store full payment details.
          </p>
          <p className="text-gray-300 mb-4">Third-party services we may use include:</p>
          <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
            <li>Hosting and analytics (Vercel)</li>
            <li>Email communication tools</li>
            <li>Payment processors</li>
          </ul>
          <p className="text-gray-300 mb-6">
            These providers have their own privacy policies governing their use of your data.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4 text-white">Data Security</h2>
          <p className="text-gray-300 mb-6">
            We take reasonable steps to protect your information, but no method of transmission over the internet is 100% secure. You share information at your own risk.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4 text-white">Your Rights</h2>
          <p className="text-gray-300 mb-4">You may request to:</p>
          <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
            <li>Access or update your personal information</li>
            <li>Request deletion of your information (subject to legal or business requirements)</li>
          </ul>
          <p className="text-gray-300 mb-6">
            To make a request, contact us using the information below.
          </p>

          <h2 className="text-2xl font-heading font-semibold mt-8 mb-4 text-white">Contact</h2>
          <p className="text-gray-300 mb-2"><strong>Email:</strong> seezee.enterprises@gmail.com</p>
          <p className="text-gray-300 mb-8"><strong>Location:</strong> Louisville, Kentucky</p>

          <hr className="border-gray-700 my-8" />
          <p className="text-gray-400 italic text-sm">
            This Privacy Policy is written in plain English to ensure accessibility for all users. If you need any clarification or have questions, please don't hesitate to reach out.
          </p>
        </article>
      </div>
    </div>
  )
}
```

### Step 3: Create Remaining Pages

Repeat the same pattern for:
- `src/app/(public)/terms/page.tsx` (Terms of Service)
- `src/app/(public)/accessibility/page.tsx` (Accessibility Statement)
- `src/app/(public)/cookies/page.tsx` (Cookie Policy)

Copy the content from the corresponding markdown files and format it as JSX.

### Step 4: Add Layout Files (Optional)

If you want consistent styling across all legal pages, create layout files:

`src/app/(public)/privacy/layout.tsx`:
```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

### Step 5: Test the Pages

1. Start your development server: `npm run dev`
2. Navigate to:
   - http://localhost:3000/privacy
   - http://localhost:3000/terms
   - http://localhost:3000/accessibility
   - http://localhost:3000/cookies
3. Verify footer links work correctly
4. Check mobile responsiveness
5. Test accessibility (keyboard navigation, screen reader)

### Step 6: Deploy to Vercel

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Add legal pages: Privacy, Terms, Accessibility, Cookies"
   git push
   ```

2. Vercel will automatically deploy

3. Verify live pages:
   - https://see-zee.com/privacy
   - https://see-zee.com/terms
   - https://see-zee.com/accessibility
   - https://see-zee.com/cookies

## Quick Implementation Option

If you want to get these pages live quickly, you can:

1. Copy the markdown content
2. Use a simple React component (like the alternative example above)
3. Paste the content directly as JSX
4. Style with Tailwind classes matching your site design

This avoids needing to install markdown parsing libraries.

## Styling Notes

- Use `prose` classes from Tailwind Typography for readable text
- Match your site's color scheme (gray-900 background, white text)
- Ensure proper heading hierarchy for accessibility
- Use consistent spacing and typography

## Accessibility Checklist

- ✅ Proper heading hierarchy (h1 → h2 → h3)
- ✅ Semantic HTML (`<article>`, `<section>`)
- ✅ Sufficient color contrast
- ✅ Keyboard navigable
- ✅ Screen reader friendly
- ✅ Plain language (already done in markdown files)

## Next Steps After Implementation

1. ✅ Legal pages created and live
2. Update sitemap.xml to include new pages
3. Add structured data (Schema.org) for legal pages
4. Monitor analytics to see if pages are being accessed
5. Consider adding a cookie banner if you expand analytics

---

*Once these pages are live, your site will have complete legal coverage and improved credibility with clients and search engines.*



