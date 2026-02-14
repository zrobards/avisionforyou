import { test, expect } from '@playwright/test'

test.describe('Blog Listing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog')
  })

  test('blog listing page loads with header', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Recovery Stories & Resources/i, level: 1 })
    ).toBeVisible()

    // Subtitle
    await expect(
      page.getByText(/Insights, experiences, and guidance/i)
    ).toBeVisible()
  })

  test('blog page shows posts or empty state', async ({ page }) => {
    // Count article elements - these represent blog posts
    const articleCount = await page.locator('article').count()

    if (articleCount > 0) {
      // If posts exist, verify each article has a title and date
      const firstArticle = page.locator('article').first()
      await expect(firstArticle).toBeVisible()

      // Each post card should have a heading (h2) with the post title
      await expect(firstArticle.locator('h2')).toBeVisible()

      // Each post card should display the date (in the footer area of the card)
      // The date is rendered as a <span> with a formatted date string
      const dateSpans = firstArticle.locator('.text-gray-500')
      const dateCount = await dateSpans.count()
      expect(dateCount).toBeGreaterThan(0)
    } else {
      // Empty state should show "Blog Coming Soon"
      await expect(page.getByText(/Blog Coming Soon/i)).toBeVisible()

      // Social media follow links should be visible in empty state
      await expect(
        page.getByRole('link', { name: /Follow Us on Facebook/i })
      ).toBeVisible()
      await expect(
        page.getByRole('link', { name: /Follow Us on Instagram/i })
      ).toBeVisible()
    }
  })

  test('blog posts display category and read time', async ({ page }) => {
    const articleCount = await page.locator('article').count()

    if (articleCount > 0) {
      const firstArticle = page.locator('article').first()

      // Category badge (gradient background span)
      const categoryBadge = firstArticle.locator(
        'span.bg-gradient-to-r'
      )
      await expect(categoryBadge).toBeVisible()

      // Read time
      await expect(firstArticle.getByText(/min read/i)).toBeVisible()
    } else {
      // Skip if no posts - empty state was already tested above
      test.skip()
    }
  })

  test('blog posts have excerpt text', async ({ page }) => {
    const articleCount = await page.locator('article').count()

    if (articleCount > 0) {
      const firstArticle = page.locator('article').first()

      // The excerpt is a paragraph with the class "line-clamp-3"
      const excerpt = firstArticle.locator('.line-clamp-3')
      await expect(excerpt).toBeVisible()

      const excerptText = await excerpt.textContent()
      expect(excerptText?.length).toBeGreaterThan(0)
    } else {
      test.skip()
    }
  })
})

test.describe('Blog Post Navigation', () => {
  test('clicking a blog post navigates to the detail page', async ({ page }) => {
    await page.goto('/blog')

    const articleCount = await page.locator('article').count()

    if (articleCount > 0) {
      // Blog posts are wrapped in a <Link> (rendered as <a>)
      // Click the first article link
      const firstPostLink = page.locator('a.group').first()
      const href = await firstPostLink.getAttribute('href')

      // Verify the link points to a blog detail page
      expect(href).toMatch(/^\/blog\//)

      await firstPostLink.click()

      // Should navigate to the detail page
      await expect(page).toHaveURL(/\/blog\/.+/)
    } else {
      test.skip()
    }
  })
})

test.describe('Blog Detail Page', () => {
  test('blog detail page shows article content', async ({ page }) => {
    await page.goto('/blog')

    const articleCount = await page.locator('article').count()

    if (articleCount > 0) {
      // Navigate to the first blog post
      const firstPostLink = page.locator('a.group').first()
      await firstPostLink.click()
      await expect(page).toHaveURL(/\/blog\/.+/)

      // The detail page should have an <article> element
      await expect(page.locator('article')).toBeVisible()

      // The post title should be displayed as an h1
      await expect(page.locator('article h1')).toBeVisible()
      const titleText = await page.locator('article h1').textContent()
      expect(titleText?.length).toBeGreaterThan(0)

      // Author name should be visible
      const authorName = page.locator('article .font-semibold').first()
      await expect(authorName).toBeVisible()

      // Back to Blog link should be present
      await expect(page.getByText(/Back to Blog/i)).toBeVisible()

      // Category badge
      await expect(
        page.locator('article span.bg-gradient-to-r').first()
      ).toBeVisible()

      // Call to action at the bottom of the post
      await expect(
        page.getByText(/Start Your Recovery Journey Today/i)
      ).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('blog detail page has structured data', async ({ page }) => {
    await page.goto('/blog')

    const articleCount = await page.locator('article').count()

    if (articleCount > 0) {
      const firstPostLink = page.locator('a.group').first()
      await firstPostLink.click()
      await expect(page).toHaveURL(/\/blog\/.+/)

      // Check for JSON-LD structured data
      const jsonLd = page.locator('script[type="application/ld+json"]')
      await expect(jsonLd).toBeAttached()

      const jsonLdContent = await jsonLd.textContent()
      expect(jsonLdContent).toBeTruthy()

      const parsed = JSON.parse(jsonLdContent!)
      expect(parsed['@type']).toBe('Article')
      expect(parsed.headline).toBeTruthy()
    } else {
      test.skip()
    }
  })

  test('blog detail page returns 404 for non-existent slug', async ({ page }) => {
    const response = await page.goto('/blog/this-slug-definitely-does-not-exist-12345')
    // Next.js returns a 404 page for posts that do not exist
    expect(response?.status()).toBe(404)
  })
})
