import { test, expect } from '@playwright/test'

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact')
  })

  test('form renders with all required fields', async ({ page }) => {
    // Name field
    const nameInput = page.locator('#contact-name')
    await expect(nameInput).toBeVisible()
    await expect(nameInput).toHaveAttribute('required', '')

    // Email field
    const emailInput = page.locator('#contact-email')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('required', '')
    await expect(emailInput).toHaveAttribute('type', 'email')

    // Phone field (not required but should be present)
    const phoneInput = page.locator('#contact-phone')
    await expect(phoneInput).toBeVisible()

    // Department select (required)
    const departmentSelect = page.locator('#contact-department')
    await expect(departmentSelect).toBeVisible()
    await expect(departmentSelect).toHaveAttribute('required', '')

    // Subject field (required)
    const subjectInput = page.locator('#contact-subject')
    await expect(subjectInput).toBeVisible()
    await expect(subjectInput).toHaveAttribute('required', '')

    // Message textarea (required)
    const messageTextarea = page.locator('#contact-message')
    await expect(messageTextarea).toBeVisible()
    await expect(messageTextarea).toHaveAttribute('required', '')

    // Submit button
    const submitButton = page.getByRole('button', { name: /Send Message/i })
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()
  })

  test('form labels are associated with their inputs', async ({ page }) => {
    // Verify label-input associations using htmlFor/id pairing
    await expect(page.locator('label[for="contact-name"]')).toBeVisible()
    await expect(page.locator('label[for="contact-email"]')).toBeVisible()
    await expect(page.locator('label[for="contact-phone"]')).toBeVisible()
    await expect(page.locator('label[for="contact-department"]')).toBeVisible()
    await expect(page.locator('label[for="contact-subject"]')).toBeVisible()
    await expect(page.locator('label[for="contact-message"]')).toBeVisible()
  })

  test('form validation prevents submission with empty required fields', async ({ page }) => {
    // Click submit without filling any fields
    const submitButton = page.getByRole('button', { name: /Send Message/i })
    await submitButton.click()

    // The browser's native validation should prevent submission.
    // The name input should be flagged as invalid since it's the first required field.
    const nameInput = page.locator('#contact-name')
    const isInvalid = await nameInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    )
    expect(isInvalid).toBe(true)

    // We should still be on the contact page (form was not submitted)
    await expect(page).toHaveURL(/\/contact/)
  })

  test('form validation shows error for invalid email', async ({ page }) => {
    // Fill in all required fields with an invalid email
    await page.locator('#contact-name').fill('Test User')
    await page.locator('#contact-email').fill('not-an-email')
    await page.locator('#contact-subject').fill('Test Subject')
    await page.locator('#contact-message').fill('Test message content.')

    // Try to submit
    const submitButton = page.getByRole('button', { name: /Send Message/i })
    await submitButton.click()

    // The email input should be invalid due to browser validation
    const emailInput = page.locator('#contact-email')
    const isInvalid = await emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    )
    expect(isInvalid).toBe(true)

    // Still on contact page
    await expect(page).toHaveURL(/\/contact/)
  })

  test('successful submission shows success message', async ({ page }) => {
    // Mock the /api/contact endpoint to return success
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    // Fill in all required fields
    await page.locator('#contact-name').fill('Test User')
    await page.locator('#contact-email').fill('test@example.com')
    await page.locator('#contact-phone').fill('5021234567')
    await page.locator('#contact-subject').fill('Test Inquiry')
    await page.locator('#contact-message').fill('This is a test message for E2E testing purposes.')

    // Submit the form
    const submitButton = page.getByRole('button', { name: /Send Message/i })
    await submitButton.click()

    // Success message should appear
    await expect(page.getByText(/Message sent successfully/i)).toBeVisible()
  })

  test('failed submission shows error message', async ({ page }) => {
    // Mock the /api/contact endpoint to return an error
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    })

    // Fill in all required fields
    await page.locator('#contact-name').fill('Test User')
    await page.locator('#contact-email').fill('test@example.com')
    await page.locator('#contact-subject').fill('Test Inquiry')
    await page.locator('#contact-message').fill('This is a test message.')

    // Submit the form
    await page.getByRole('button', { name: /Send Message/i }).click()

    // Error message should appear
    await expect(page.getByText(/Failed to send message/i)).toBeVisible()
  })

  test('contact information cards are visible', async ({ page }) => {
    // Phone card
    await expect(page.getByText('Call Us')).toBeVisible()
    await expect(page.getByText('(502) 749-6344')).toBeVisible()

    // Email card
    await expect(page.getByText('Email Us')).toBeVisible()
    await expect(page.getByText('info@avisionforyourecovery.org')).toBeVisible()

    // Address card
    await expect(page.getByText('Visit Us')).toBeVisible()
    await expect(page.getByText('1675 Story Ave')).toBeVisible()

    // Office hours card
    await expect(page.getByText('Office Hours')).toBeVisible()
    await expect(page.getByText('Monday - Friday:')).toBeVisible()
  })
})
