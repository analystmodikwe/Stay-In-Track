import { test, expect } from '@playwright/test'

test.describe('Flow 2 - Create a Plan and add a Member', () => {
  const timestamp = Date.now()
  const planName = `E2E Plan ${timestamp}`
  const memberName = `E2E Member ${timestamp}`
  const memberEmail = `e2e_member_${timestamp}@example.com`

  test('T-E2E-2 Admin logs in, creates a Plan, and adds a Member', async ({ page }) => {
    // 1. Log in as seed Admin
    await page.goto('/log-in')
    await page.getByLabel(/email/i).fill('sipho@ironhaven.example.com')
    await page.getByLabel(/^password$/i).fill(process.env.SEED_TEST_PASSWORD || 'TestPass1234!')
    await page.getByRole('button', { name: /log in/i }).click()

    await expect(page).toHaveURL(/.*dashboard/)

    // 2. Open Plans tab
    await page.locator('a[href="/plans"]:visible').first().click()
    await expect(page).toHaveURL(/.*plans/)

    // 3. Create a new Plan
    await page.getByRole('button', { name: /add plan/i }).first().click()
    await expect(page.getByRole('heading', { name: 'Add plan' })).toBeVisible()

    await page.getByLabel('Plan name').fill(planName)
    await page.getByLabel('Price per month (R)').fill('400')
    await page.getByLabel('Benefits (optional)').fill('Full gym floor access')
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByText('Plan saved')).toBeVisible()
    await expect(page.getByText(planName)).toBeVisible()

    // 4. Open Members tab
    await page.locator('a[href="/members"]:visible').first().click()
    await expect(page).toHaveURL(/.*members/)

    // 5. Add a new Member
    await page.getByRole('button', { name: /add member/i }).first().click()
    await expect(page.getByRole('heading', { name: 'Add member' })).toBeVisible()

    await page.getByLabel('Full name').fill(memberName)
    await page.getByLabel('Email').fill(memberEmail)
    await page.getByLabel('This Member is 18 or older').check()
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByText('Member added')).toBeVisible()
    await expect(page.getByText(memberName)).toBeVisible()
    await expect(page.getByText('Overdue').first()).toBeVisible()
  })
})

