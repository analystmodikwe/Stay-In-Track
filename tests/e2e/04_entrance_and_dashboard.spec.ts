import { test, expect } from '@playwright/test'

test.describe('Flow 4 & Flow 5 - Entrance Status check and Admin Dashboard', () => {
  test('T-E2E-4 Search for member and view Admin Dashboard stats', async ({ page }) => {
    // 1. Log in as seed Admin
    await page.goto('/log-in')
    await page.getByLabel(/email/i).fill('sipho@ironhaven.example.com')
    await page.getByLabel(/^password$/i).fill(process.env.SEED_TEST_PASSWORD || 'TestPass1234!')
    await page.getByRole('button', { name: /log in/i }).click()

    await expect(page).toHaveURL(/.*dashboard/)

    // 2. Dashboard shows stat cards: Total Members, Active, Overdue, Revenue this month
    await expect(page.getByText('Total Members')).toBeVisible()
    await expect(page.getByText('Active')).toBeVisible()
    await expect(page.getByText('Revenue this month')).toBeVisible()
    await expect(page.getByText('Members per Plan')).toBeVisible()

    // 3. Open Members tab (S6 Entrance check)
    await page.locator('a[href="/members"]:visible').first().click()
    await expect(page).toHaveURL(/.*members/)

    // 4. Flow 4: Search "tha"
    const searchInput = page.getByPlaceholder(/search by name or email/i)
    await expect(searchInput).toBeVisible()
    await searchInput.fill('tha')

    // Thando Mokoena appears in search results
    await expect(page.getByText('Thando Mokoena')).toBeVisible()

    // Tap Thando row to view details (S7)
    await page.getByText('Thando Mokoena').click()
    await expect(page).toHaveURL(/.*members\/.*/)
    await expect(page.getByRole('heading', { name: 'Thando Mokoena' })).toBeVisible()
  })
})

