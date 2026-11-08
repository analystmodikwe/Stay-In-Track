import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

test.describe('Flow 7 - Reset Password (T-E2E-6)', () => {
  const timestamp = Date.now()

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

  test('T-E2E-6 forgot password -> link in email -> new password set -> log in', async ({ page }, testInfo) => {
    const userEmail = `reset_user_${timestamp}_${testInfo.parallelIndex}@example.com`
    const initialPassword = 'InitialPassword123!'
    const newPassword = 'NewPassword456!'

    // 1. Create confirmed user via Supabase admin client
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { error: createError } = await adminClient.auth.admin.createUser({
      email: userEmail,
      password: initialPassword,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        full_name: 'Reset Test User',
        gym_name: 'Reset Gym',
        is_18_or_older: true,
      },
    })
    expect(createError).toBeNull()

    // 2. Open Log In (S3)
    await page.goto('/log-in')
    await expect(page.getByRole('heading', { name: /^log in$/i })).toBeVisible()

    // 3. Click "Forgot password?"
    await page.getByRole('link', { name: /forgot password/i }).click()
    await expect(page).toHaveURL(/.*forgot-password/)

    // 4. Fill email and submit
    await page.getByLabel(/email/i).fill(userEmail)
    await page.getByRole('button', { name: /send link/i }).click()

    // 5. Verify neutral notice banner appears
    await expect(
      page.getByText("If an account exists for this email, we've sent a reset link.")
    ).toBeVisible()

    // 6. Generate recovery link via admin API
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: userEmail,
      options: {
        redirectTo: 'http://localhost:5173/forgot-password',
      },
    })
    expect(linkError).toBeNull()
    expect(linkData?.properties?.action_link).toBeTruthy()

    // 7. Navigate to the recovery action link (using localhost to avoid WSL2 127.0.0.1 relay issue)
    const actionLink = linkData!.properties!.action_link.replace('127.0.0.1', 'localhost')
    await page.goto(actionLink, { waitUntil: 'commit' })

    // 8. Should land on "Set new password" form
    // Supabase redirects to /forgot-password#access_token=...&type=recovery after verifying the token.
    await page.waitForURL(/forgot-password/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: /set new password/i })).toBeVisible({ timeout: 10000 })

    // 9. Enter new password and save
    await page.getByLabel(/new password/i).fill(newPassword)
    await page.getByRole('button', { name: /save password/i }).click()

    // 10. Verify success message and redirect to Log In
    await expect(page.getByText('Password updated. Please log in.')).toBeVisible()
    await expect(page).toHaveURL(/.*log-in/, { timeout: 10000 })

    // 11. Log in with the NEW password
    await page.getByLabel(/email/i).fill(userEmail)
    await page.getByLabel(/^password$/i).fill(newPassword)
    await page.getByRole('button', { name: /log in/i }).click()

    // 12. Land on dashboard
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible()
  })
})
