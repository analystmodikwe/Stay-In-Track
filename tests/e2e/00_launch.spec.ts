import { test, expect } from '@playwright/test'

test.use({
  viewport: { width: 390, height: 844 },
})

test('T-SETUP-4 opens app at 390px and shows Create account on S1', async ({ page }) => {
  await page.goto('/')
  const createAccountBtn = page.getByRole('button', { name: 'Create account' })
  await expect(createAccountBtn).toBeVisible()
  await expect(page.getByText('Know who has paid. Every time.')).toBeVisible()
})

