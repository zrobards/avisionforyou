# SEO Quick Reference Guide

## 🚀 Quick Commands

```bash
# View robots.txt locally
curl http://localhost:3000/robots.txt

# View sitemap locally
curl http://localhost:3000/sitemap.xml

# Check OG image generation
open http://localhost:3000/opengraph-image

# Build and test production
npm run build && npm start
```

## 📝 Adding SEO to New Pages

### 1. For Public Pages (with Client Components)

Create a `layout.tsx` in the page directory:

```typescript
// src/app/new-page/layout.tsx
import { generatePageMetadata } from '@/lib/metadata'

export const metadata = generatePageMetadata({
  title: 'Page Title',
  description: 'SEO-optimized description (120-160 chars)',
  path: '/new-page',
  keywords: ['keyword1', 'keyword2'],
})

export default function PageLayout({ children }: { children: React.ReactNode }) {
  // Optional: Add page-specific structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Page Name',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  )
}
```

### 2. For Server Component Pages

Add metadata export directly:

```typescript
// src/app/new-page/page.tsx
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/metadata'

export const metadata: Metadata = generatePageMetadata({
  title: 'Page Title',
  description: 'Description here',
  path: '/new-page',
})

export default function Page() {
  return <div>Content</div>
}
```

### 3. Update Sitemap

Edit `src/app/sitemap.ts` and add your new page:

```typescript
{
  url: `${baseUrl}/new-page`,
  lastModified: currentDate,
  changeFrequency: 'weekly',
  priority: 0.8,
}
```

## 🎨 Structured Data Templates

### Service Offer
```typescript
{
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Service Name',
  description: 'Service description',
  provider: {
    '@type': 'Organization',
    name: 'SeeZee Studio',
  },
  offers: {
    '@type': 'Offer',
    price: '99',
    priceCurrency: 'USD',
  },
}
```

### Article/Blog Post
```typescript
import { generateArticleSchema } from '@/lib/seo-utils'

const schema = generateArticleSchema({
  headline: 'Article Title',
  description: 'Article description',
  image: 'https://see-zee.com/image.jpg',
  datePublished: '2024-11-07',
  authorName: 'Sean McCulloch',
  url: 'https://see-zee.com/article',
})
```

### FAQ Section
```typescript
import { generateFAQSchema } from '@/lib/seo-utils'

const schema = generateFAQSchema([
  {
    question: 'How long does it take?',
    answer: 'We build websites in 48 hours.',
  },
  {
    question: 'What is included?',
    answer: 'Hosting, security, and lifetime maintenance.',
  },
])
```

## 🔍 SEO Best Practices Checklist

### Title Tags
- [ ] 30-60 characters
- [ ] Include primary keyword
- [ ] Unique for each page
- [ ] Brand name at end (auto-added by template)

### Meta Descriptions
- [ ] 120-160 characters
- [ ] Include primary keyword
- [ ] Call to action
- [ ] Unique for each page
- [ ] Compelling and descriptive

### Keywords
- [ ] Focus on 1-3 primary keywords per page
- [ ] Use long-tail variations
- [ ] Natural language, not stuffed
- [ ] Include in title, description, headings, content

### Content
- [ ] Minimum 300 words per page
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Include internal links
- [ ] Add external authoritative links
- [ ] Use descriptive anchor text

### Images
- [ ] Descriptive file names (use-hyphens.jpg)
- [ ] Alt text for all images
- [ ] Compressed and optimized
- [ ] Modern formats (WebP, AVIF)
- [ ] Appropriate dimensions

### URLs
- [ ] Short and descriptive
- [ ] Use hyphens, not underscores
- [ ] Lowercase only
- [ ] Include keywords when relevant
- [ ] No unnecessary parameters

## 📊 Metadata Limits

| Element | Min | Optimal | Max |
|---------|-----|---------|-----|
| Title | 30 | 50-60 | 60 |
| Description | 120 | 150-160 | 160 |
| Keywords | - | 5-10 | 15 |
| H1 | 20 | 30-70 | 70 |
| URL | - | 50-60 | 100 |

## 🧪 Testing After Changes

1. **Local Testing**
   ```bash
   npm run build
   npm start
   # Visit http://localhost:3000
   ```

2. **Check Meta Tags**
   - View page source (Ctrl+U / Cmd+U)
   - Look for `<meta>` tags in `<head>`
   - Verify OG tags, Twitter cards

3. **Validate Structured Data**
   - Google Rich Results Test
   - Schema.org Validator
   - Copy JSON-LD from page source

4. **Test Social Sharing**
   - Facebook Sharing Debugger
   - Twitter Card Validator
   - LinkedIn Post Inspector

## 🔧 Common Issues & Fixes

### Issue: Metadata not showing
- ✅ Check if page is client component (needs layout.tsx)
- ✅ Verify metadata export is at top level
- ✅ Clear Next.js cache: `rm -rf .next`
- ✅ Rebuild: `npm run build`

### Issue: Structured data errors
- ✅ Validate JSON syntax
- ✅ Check required fields for schema type
- ✅ Use https:// URLs, not http://
- ✅ Ensure dates are in ISO 8601 format

### Issue: Sitemap not updating
- ✅ Check `src/app/sitemap.ts` syntax
- ✅ Clear cache and rebuild
- ✅ Verify file is being generated in build output

### Issue: OG image not showing
- ✅ Check `src/app/opengraph-image.tsx` exists
- ✅ Verify image dimensions (1200x630)
- ✅ Test URL directly: `/opengraph-image`
- ✅ Clear cache in social media debuggers

## 📈 Monitoring Checklist

### Daily
- [ ] Check Google Search Console for critical errors

### Weekly
- [ ] Review search performance (impressions, clicks, CTR)
- [ ] Check for new crawl errors
- [ ] Monitor Core Web Vitals
- [ ] Review keyword rankings

### Monthly
- [ ] Update meta descriptions for low CTR pages
- [ ] Add new content/pages
- [ ] Build quality backlinks
- [ ] Competitive analysis
- [ ] Review analytics data

### Quarterly
- [ ] Full SEO audit with Lighthouse
- [ ] Update structured data
- [ ] Review and refresh old content
- [ ] Check for broken links
- [ ] Update sitemap if needed

## 🔗 Useful Links

- **Search Console**: https://search.google.com/search-console
- **Rich Results Test**: https://search.google.com/test/rich-results
- **Schema Validator**: https://validator.schema.org/
- **FB Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Validator**: https://cards-dev.twitter.com/validator
- **PageSpeed Insights**: https://pagespeed.web.dev/

## 💡 Pro Tips

1. **Update Dates**: Change `lastModified` in sitemap when content changes
2. **Internal Linking**: Link related pages together
3. **Mobile First**: Always test on mobile devices
4. **Speed Matters**: Keep page load under 3 seconds
5. **Content Quality**: Focus on valuable, unique content
6. **Local SEO**: Leverage Louisville, KY location in content
7. **Social Signals**: Encourage sharing on social media
8. **User Experience**: Good UX leads to better SEO

## 🆘 Need Help?

1. Check full documentation: `docs/seo-implementation.md`
2. Review checklist: `docs/seo-checklist.md`
3. Check utilities: `src/lib/seo-utils.ts`
4. Next.js docs: https://nextjs.org/docs
5. Schema.org: https://schema.org/

---

**Remember**: SEO is ongoing. Keep monitoring, testing, and improving!
















