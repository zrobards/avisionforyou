import { test, expect } from '@playwright/test'

test.describe('Admin Blog Management', () => {
  test('blog listing page loads', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.locator('h1')).toContainText('Recovery Stories')
  })

  test('individual blog post renders with proper formatting', async ({ page }) => {
    // Navigate to blog listing
    await page.goto('/blog')

    // If there are posts, click the first one
    const firstPost = page.locator('article a, a:has(article)').first()
    if (await firstPost.isVisible()) {
      await firstPost.click()
      // Verify blog content container exists with proper styling
      await expect(page.locator('.blog-content')).toBeVisible()
      // Verify author info is displayed
      await expect(page.locator('text=Lucas Bennett')).toBeVisible()
    }
  })

  test('donation page loads and shows form', async ({ page }) => {
    await page.goto('/donate')
    await expect(page.locator('h1, h2').first()).toBeVisible()
    // Check preset donation amounts exist
    await expect(page.locator('text=$25')).toBeVisible()
    await expect(page.locator('text=$100')).toBeVisible()
  })

  test('donation success page exists', async ({ page }) => {
    await page.goto('/donate/success')
    await expect(page.locator('text=Thank You')).toBeVisible()
  })

  test('contact form loads', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.locator('form')).toBeVisible()
  })

  test('programs page lists all programs', async ({ page }) => {
    await page.goto('/programs')
    await expect(page.locator('text=Surrender Program')).toBeVisible()
    await expect(page.locator('text=MindBodySoul')).toBeVisible()
    await expect(page.locator('text=Housing')).toBeVisible()
  })

  test('assessment page loads', async ({ page }) => {
    await page.goto('/assessment')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })
})
