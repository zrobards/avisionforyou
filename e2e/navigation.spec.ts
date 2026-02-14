import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/A Vision For You/)
    await expect(page.getByRole('heading', { name: 'A Vision For You', level: 1 })).toBeVisible()
  })

  test('Programs page loads with program content', async ({ page }) => {
    await page.goto('/programs')
    await expect(page.getByRole('heading', { name: /Our Programs/i, level: 1 })).toBeVisible()

    // The 6 core programs should always appear (from hardcoded fallbacks)
    const expectedPrograms = [
      'Surrender Program',
      'MindBodySoul IOP',
      'Housing & Shelter',
      'Meetings & Groups',
      'Food & Nutrition',
      'Career Reentry',
    ]

    for (const program of expectedPrograms) {
      await expect(page.getByText(program).first()).toBeAttached()
    }
  })

  test('Blog page loads with posts or empty state', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.getByRole('heading', { name: /Recovery Stories & Resources/i, level: 1 })).toBeVisible()

    // The blog page either shows posts or a "Blog Coming Soon" empty state
    const hasPosts = await page.locator('article').count()
    if (hasPosts > 0) {
      // At least one post article is visible
      await expect(page.locator('article').first()).toBeVisible()
    } else {
      // Empty state message
      await expect(page.getByText(/Blog Coming Soon/i)).toBeVisible()
    }
  })

  test('Contact page loads with contact form', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.getByRole('heading', { name: /Get in Touch/i, level: 1 })).toBeVisible()

    // The form heading
    await expect(page.getByText('Send Us a Message')).toBeVisible()

    // Contact info sidebar
    await expect(page.getByText('(502) 749-6344')).toBeVisible()
    await expect(page.getByText('info@avisionforyourecovery.org')).toBeVisible()
  })

  test('Donate page loads with donation options', async ({ page }) => {
    await page.goto('/donate')
    await expect(page.getByRole('heading', { name: /Make an Impact Today/i, level: 1 })).toBeVisible()

    // Donation amount buttons should be present
    await expect(page.getByText('$25', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('$50', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('$100', { exact: false }).first()).toBeVisible()
  })

  test('About page loads', async ({ page }) => {
    await page.goto('/about')
    await expect(page).toHaveURL(/\/about/)
    // Page should not show a 404
    await expect(page.locator('body')).not.toContainText('404')
  })

  test('navigating from navbar links works correctly', async ({ page }) => {
    await page.goto('/')

    // Click Programs link in the navbar
    await page.locator('nav a[href="/programs"]').first().click()
    await expect(page).toHaveURL(/\/programs/)
    await expect(page.getByRole('heading', { name: /Our Programs/i, level: 1 })).toBeVisible()

    // Navigate to Contact from navbar
    await page.locator('nav a[href="/contact"]').first().click()
    await expect(page).toHaveURL(/\/contact/)
    await expect(page.getByRole('heading', { name: /Get in Touch/i, level: 1 })).toBeVisible()

    // Navigate to Donate from navbar
    await page.locator('nav a[href="/donate"]').first().click()
    await expect(page).toHaveURL(/\/donate/)
    await expect(page.getByRole('heading', { name: /Make an Impact Today/i, level: 1 })).toBeVisible()
  })
})
