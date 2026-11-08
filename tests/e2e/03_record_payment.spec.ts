import { test, expect } from '@playwright/test'

test.describe('Flow 3 - Record a Payment and Undo it', () => {
  test('T-E2E-3 Admin records a Payment and undoes it', async ({ page }) => {
    const timestamp = Date.now()
    const memberName = `Payment Test Member ${timestamp}`
    const memberEmail = `pay_test_${timestamp}@example.com`

    // 1. Log in as seed Admin
    await page.goto('/log-in')
    await page.getByLabel(/email/i).fill('sipho@ironhaven.example.com')
    await page.getByLabel(/^password$/i).fill(process.env.SEED_TEST_PASSWORD || 'TestPass1234!')
    await page.getByRole('button', { name: /log in/i }).click()

    await expect(page).toHaveURL(/.*dashboard/)

    // 2. Open Members tab
    await page.locator('a[href="/members"]:visible').first().click()
    await expect(page).toHaveURL(/.*members/)

    // 3. Add a fresh member for isolated, deterministic payment flow
    await page.getByRole('button', { name: /add member/i }).first().click()
    await page.getByLabel('Full name').fill(memberName)
    await page.getByLabel('Email').fill(memberEmail)
    await page.getByLabel('This Member is 18 or older').check()
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByText('Member added')).toBeVisible()
    await expect(page.getByText(memberName)).toBeVisible()

    // 4. Open Member Details
    await page.getByText(memberName).click()
    await expect(page).toHaveURL(/.*members\/.*/)
    await expect(page.getByRole('heading', { name: memberName })).toBeVisible()
    await expect(page.getByText('No Payment yet')).toBeVisible()

    // 5. Click "Record payment"
    await page.getByRole('button', { name: /record payment/i }).click()
    await expect(page.getByRole('heading', { name: 'Record payment' })).toBeVisible()

    // 6. Save payment
    await page.getByRole('button', { name: 'Save payment' }).click()

    // 7. See toast "Payment recorded", badge "Active"
    await expect(page.getByText('Payment recorded')).toBeVisible()
    await expect(page.getByText('Active')).toBeVisible()

    // 8. Latest payment has "Undo" button; click "Undo"
    const undoButton = page.getByRole('button', { name: 'Undo' }).first()
    await expect(undoButton).toBeVisible()
    await undoButton.click()

    // 9. M6 pop-up appears: "Undo this Payment?"
    await expect(page.getByText('Undo this Payment?')).toBeVisible()
    await expect(page.getByText('The Member goes back to No Payment yet.')).toBeVisible()
    await page.getByRole('button', { name: 'Undo Payment' }).click()

    // 10. Toast "Payment undone", status restores to "Overdue" and "No Payment yet"
    await expect(page.getByText('Payment undone')).toBeVisible()
    await expect(page.getByText('Overdue')).toBeVisible()
    await expect(page.getByText('No Payment yet')).toBeVisible()
  })
})
