import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

test.describe('Flow 6 - Member Sign-up & Dashboard', () => {
  test('T-E2E-5 Member signs up with added email, verifies, logs in and sees S9 My membership', async ({
    page,
  }, testInfo) => {
    test.setTimeout(60000)
    const timestamp = `${Date.now()}_${testInfo.parallelIndex}`
    const memberName = `Kagiso Rabada ${timestamp}`
    const memberEmail = `kagiso_${timestamp}@example.com`
    const memberPassword = process.env.SEED_TEST_PASSWORD || 'TestPass1234!'

    // 1. Log in as seed Admin
    await page.goto('/log-in')
    await page.getByLabel(/email/i).fill('sipho@ironhaven.example.com')
    await page.getByLabel(/^password$/i).fill(memberPassword)
    await page.getByRole('button', { name: /log in/i }).click()
    await expect(page).toHaveURL(/.*dashboard/)

    // 2. Open Members tab and add new member
    await page.locator('a[href="/members"]:visible').first().click()
    await expect(page).toHaveURL(/.*members/)

    await page.getByRole('button', { name: /add member/i }).first().click()
    await page.getByLabel('Full name').fill(memberName)
    await page.getByLabel('Email', { exact: true }).fill(memberEmail)
    await page.getByLabel('This Member is 18 or older').check()
    await page.getByRole('button', { name: 'Save' }).click({ force: true })

    await expect(page.getByText('Member added')).toBeVisible({ timeout: 15000 })

    // 3. Log out via Settings
    await page.goto('/settings')
    await expect(page).toHaveURL(/.*settings/)
    await page.getByRole('button', { name: /logout/i }).click()
    await expect(page).toHaveURL(/\/(?:welcome)?$/)

    // 4. Sign up as Member
    await page.goto('/sign-up')
    await page.getByLabel('Account type').selectOption('member')
    await page.getByLabel('Full name').fill(memberName)
    await page.getByLabel('Email', { exact: true }).fill(memberEmail)
    await page.getByLabel(/^password$/i).fill(memberPassword)
    await page.getByLabel('I am 18 or older').check()
    await page.getByLabel(/i agree to the privacy notice/i).check()
    await page.getByRole('button', { name: /sign up/i }).click()

    // 5. Lands on /log-in with verify banner
    await expect(page).toHaveURL(/.*log-in/, { timeout: 15000 })
    await expect(
      page.getByText('Check your email and tap the link to verify your account.')
    ).toBeVisible()

    // 6. Confirm user's email via Supabase admin client
    let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    let supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'

    if (!serviceKey) {
      try {
        const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8')
        for (const line of envContent.split('\n')) {
          const [k, ...v] = line.trim().split('=')
          if (k === 'SUPABASE_SERVICE_ROLE_KEY') serviceKey = v.join('=')
          if (k === 'VITE_SUPABASE_URL') supabaseUrl = v.join('=')
        }
      } catch {
        // ignore
      }
    }

    if (serviceKey) {
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      const { data: users } = await adminClient.auth.admin.listUsers()
      const user = users?.users?.find((u) => u.email === memberEmail)
      if (user) {
        await adminClient.auth.admin.updateUserById(user.id, { email_confirm: true })
      }
    }

    // 7. Log in as Member
    await page.getByLabel(/email/i).fill(memberEmail)
    await page.getByLabel(/^password$/i).fill(memberPassword)
    await page.getByRole('button', { name: /log in/i }).click()

    // 8. Lands on S9 (/home)
    await expect(page).toHaveURL(/.*home/)
    await expect(page.getByRole('heading', { name: /my membership/i })).toBeVisible()
    await expect(page.getByText('Iron Haven Gym')).toBeVisible()
    await expect(page.getByText('Overdue')).toBeVisible()
    await expect(page.getByText('No Payment yet')).toBeVisible()
  })
})

