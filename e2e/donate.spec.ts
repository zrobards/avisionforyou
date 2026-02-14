import { test, expect } from '@playwright/test'

test.describe('Donate Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/donate')
  })

  test('page loads with main heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Make an Impact Today/i, level: 1 })
    ).toBeVisible()
  })

  test('donation amount buttons are visible', async ({ page }) => {
    // The five preset impact levels: $25, $50, $100, $250, $500
    const amounts = ['$25', '$50', '$100', '$250', '$500']

    for (const amount of amounts) {
      await expect(page.getByText(amount, { exact: true }).first()).toBeVisible()
    }
  })

  test('impact descriptions are shown for each amount', async ({ page }) => {
    await expect(page.getByText('Provides 10 meals')).toBeVisible()
    await expect(page.getByText('Supports 1 day of shelter')).toBeVisible()
    await expect(page.getByText('Covers 1 week of recovery support')).toBeVisible()
    await expect(page.getByText('Provides 1 month of peer counseling')).toBeVisible()
    await expect(page.getByText('Sponsors 1 full recovery program bed')).toBeVisible()
  })

  test('selecting a preset amount updates the total', async ({ page }) => {
    // Click the $100 button
    await page.getByText('$100', { exact: true }).first().click()

    // The summary section should show $100.00
    await expect(page.getByText('$100.00').first()).toBeVisible()
  })

  test('custom amount input works', async ({ page }) => {
    const customInput = page.locator('#donate-custom-amount')
    await expect(customInput).toBeVisible()

    // Enter a custom amount
    await customInput.fill('75')

    // The summary should reflect the custom amount
    await expect(page.getByText('$75.00').first()).toBeVisible()
  })

  test('donation frequency buttons exist and are clickable', async ({ page }) => {
    // One-Time button
    const oneTimeButton = page.getByRole('button', { name: /One-Time/i })
    await expect(oneTimeButton).toBeVisible()

    // Monthly button
    const monthlyButton = page.getByRole('button', { name: /Monthly/i })
    await expect(monthlyButton).toBeVisible()

    // Yearly button
    const yearlyButton = page.getByRole('button', { name: /Yearly/i })
    await expect(yearlyButton).toBeVisible()

    // Click Monthly and verify the annual impact appears
    await monthlyButton.click()
    await expect(page.getByText(/Annual Impact/i)).toBeVisible()
  })

  test('donor information fields are present', async ({ page }) => {
    // Full Name input
    const nameInput = page.locator('#donate-name')
    await expect(nameInput).toBeVisible()
    await expect(nameInput).toHaveAttribute('required', '')

    // Email Address input
    const emailInput = page.locator('#donate-email')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('required', '')
  })

  test('donate button is present and disabled without required info', async ({ page }) => {
    // Clear any pre-filled values by clearing inputs
    await page.locator('#donate-name').fill('')
    await page.locator('#donate-email').fill('')

    // The button should be disabled when name and email are empty
    const donateButton = page.getByRole('button', { name: /Complete Donation/i })
    await expect(donateButton).toBeVisible()
    await expect(donateButton).toBeDisabled()
  })

  test('donate button becomes enabled when form is filled', async ({ page }) => {
    await page.locator('#donate-name').fill('Test Donor')
    await page.locator('#donate-email').fill('donor@example.com')

    // With a preset amount selected ($50 is default) and info filled,
    // the button should be enabled
    const donateButton = page.getByRole('button', { name: /Complete Donation/i })
    await expect(donateButton).toBeEnabled()
  })

  test('payment method selector is visible', async ({ page }) => {
    // Square button should be visible (always configured)
    await expect(page.getByRole('button', { name: /Square/i })).toBeVisible()
  })

  test('tax-deductible disclosure is present', async ({ page }) => {
    await expect(page.getByText(/Tax-Deductible Giving/i)).toBeVisible()
    await expect(page.getByText(/501\(c\)\(3\) nonprofit organization/i)).toBeVisible()
  })

  test('impact section at bottom of page is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Your Donations Change Lives/i })
    ).toBeVisible()
  })
})
