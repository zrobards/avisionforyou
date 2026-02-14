import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page loads with title containing "A Vision For You"', async ({ page }) => {
    await expect(page).toHaveTitle(/A Vision For You/)
  })

  test('navigation links are present', async ({ page }) => {
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()

    // The navbar contains links to all main sections.
    // On desktop some labels are hidden behind xl:inline, so we check href attributes.
    await expect(nav.locator('a[href="/programs"]')).toBeAttached()
    await expect(nav.locator('a[href="/donate"]')).toBeAttached()
    await expect(nav.locator('a[href="/contact"]')).toBeAttached()

    // "About" and "Blog" are dropdown buttons on desktop; verify the buttons exist
    await expect(nav.getByText('About')).toBeAttached()
    await expect(nav.getByText('Blog')).toBeAttached()
  })

  test('footer contains organization info', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    // Organization name
    await expect(footer.getByText('A Vision For You')).toBeVisible()

    // Phone number
    await expect(footer.getByText('(502) 749-6344')).toBeVisible()

    // Email
    await expect(footer.getByText('info@avisionforyourecovery.org')).toBeVisible()

    // Address
    await expect(footer.getByText('1675 Story Ave')).toBeVisible()
    await expect(footer.getByText('Louisville, KY 40206')).toBeVisible()

    // Copyright
    const currentYear = new Date().getFullYear().toString()
    await expect(footer.getByText(new RegExp(`${currentYear}.*A Vision For You`))).toBeVisible()
  })

  test('hero section is visible', async ({ page }) => {
    // The hero is the first <section> on the page
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()

    // Main heading
    await expect(page.getByRole('heading', { name: 'A Vision For You', level: 1 })).toBeVisible()

    // CTA buttons in the hero
    await expect(page.getByRole('link', { name: /Explore Programs/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Make a Donation/i })).toBeVisible()
  })

  test('programs section displays all 6 core programs', async ({ page }) => {
    const programTitles = [
      'MindBodySoul IOP',
      'Surrender Program',
      'Housing & Shelter',
      'Meetings & Groups',
      'Food & Nutrition',
      'Career Reentry',
    ]

    for (const title of programTitles) {
      await expect(page.getByText(title).first()).toBeVisible()
    }
  })

  test('testimonials section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Success Stories/i })).toBeVisible()
    // At least one testimonial name is visible
    await expect(page.getByText('Josh J.')).toBeVisible()
  })
})

test.describe('Homepage - Mobile Menu', () => {
  // Use Mobile Chrome viewport for this group
  test.use({ viewport: { width: 390, height: 844 } })

  test('mobile menu opens and shows navigation links', async ({ page }) => {
    await page.goto('/')

    // The mobile menu toggle button
    const menuButton = page.getByRole('button', { name: /Toggle menu/i })
    await expect(menuButton).toBeVisible()

    // Open the mobile menu
    await menuButton.click()

    // Wait for mobile menu to appear
    const mobileMenu = page.locator('nav .lg\\:hidden.absolute')
    await expect(mobileMenu).toBeVisible()

    // Check navigation links in the mobile menu
    await expect(mobileMenu.getByText('Home')).toBeVisible()
    await expect(mobileMenu.getByText('Programs')).toBeVisible()
    await expect(mobileMenu.getByText('Meetings & Groups')).toBeVisible()
    await expect(mobileMenu.getByText('Contact')).toBeVisible()
    await expect(mobileMenu.getByText('Donate')).toBeVisible()

    // About and Blog are collapsible sections in mobile
    await expect(mobileMenu.getByText('About')).toBeVisible()
    await expect(mobileMenu.getByText('Blog')).toBeVisible()
  })

  test('mobile menu closes when a link is clicked', async ({ page }) => {
    await page.goto('/')

    const menuButton = page.getByRole('button', { name: /Toggle menu/i })
    await menuButton.click()

    const mobileMenu = page.locator('nav .lg\\:hidden.absolute')
    await expect(mobileMenu).toBeVisible()

    // Click "Programs" link
    await mobileMenu.getByText('Programs').click()

    // Page should navigate away; mobile menu should be gone
    await expect(page).toHaveURL(/\/programs/)
  })
})
