import { test, expect } from '@playwright/test'

test.describe('Flow 1 (part 1) - Admin Sign-up & Login', () => {
  const timestamp = Date.now()
  const adminEmail = `e2e_admin_${timestamp}@example.com`
  const adminPassword = 'Password123!'
  const gymName = `E2E Gym ${timestamp}`

  test('T-E2E-1 Admin signs up, sees verify banner, verifies, logs in and reaches Dashboard', async ({ page }) => {
    // 1. Open Welcome (S1)
    await page.goto('/')
    await expect(page.getByText('STAY IN TRACK')).toBeVisible()

    // 2. Click "Create account" -> S2
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page).toHaveURL(/.*sign-up/)

    // 3. Fill in Admin registration form
    await page.getByLabel(/gym name/i).fill(gymName)
    await page.getByLabel(/full name/i).fill('E2E Admin')
    await page.getByLabel(/email/i).fill(adminEmail)
    await page.getByLabel(/^password$/i).fill(adminPassword)
    await page.getByLabel(/i am 18 or older/i).check()
    await page.getByLabel(/i agree to the privacy notice/i).check()

    // 4. Submit form
    await page.getByRole('button', { name: /sign up/i }).click()

    // 5. Land on Log In (S3) with verification banner
    await expect(page).toHaveURL(/.*log-in/, { timeout: 15000 })
    await expect(
      page.getByText('Check your email and tap the link to verify your account.')
    ).toBeVisible()

    // 6. Confirm user directly via backend API / mailpit simulation so login succeeds
    const fs = await import('fs')
    const path = await import('path')
    let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    let supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'

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
      const { createClient } = await import('@supabase/supabase-js')
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      const { data: users } = await adminClient.auth.admin.listUsers()
      const user = users?.users?.find(u => u.email === adminEmail)
      if (user) {
        await adminClient.auth.admin.updateUserById(user.id, {
          email_confirm: true,
        })
      }
    }

    // 7. Log in on S3
    await page.getByLabel(/email/i).fill(adminEmail)
    await page.getByLabel(/^password$/i).fill(adminPassword)
    await page.getByRole('button', { name: /log in/i }).click()

    // 8. Reach S5 (Dashboard) and verify empty state: "No Members yet. Add your first Member."
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible()
    await expect(page.getByText('No Members yet. Add your first Member.')).toBeVisible()
  })
})
