import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

test.describe('Flow 8 - Settings, Reminders & Delete Account (T-E2E-7)', () => {
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

  test('T-E2E-7 Admin settings (Grace period, Privacy, Log out) & Member settings (reminders, delete account)', async ({ page }, testInfo) => {
    // ----------------------------------------------------
    // PART 1: Admin Flow
    // ----------------------------------------------------
    // Log in as seed Admin
    const adminPassword = process.env.SEED_TEST_PASSWORD || 'TestPass1234!'
    await page.goto('/log-in')
    await page.getByLabel(/email/i).fill('sipho@ironhaven.example.com')
    await page.getByLabel(/^password$/i).fill(adminPassword)
    await page.getByRole('button', { name: /log in/i }).click()
    await expect(page).toHaveURL(/.*dashboard/)

    // Go to Settings
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: /^settings$/i })).toBeVisible()

    // Admin sees read-only account details
    await expect(page.getByText('sipho@ironhaven.example.com')).toBeVisible()

    // Change Grace period to 5 days and save
    const graceInput = page.getByLabel(/grace period/i)
    await graceInput.fill('5')
    await page.getByRole('button', { name: /^save$/i }).click()
    await expect(page.getByText('Grace period saved')).toBeVisible()

    // Reset Grace period back to 3 days for test cleanliness
    await graceInput.fill('3')
    await page.getByRole('button', { name: /^save$/i }).click()
    await expect(page.getByText('Grace period saved')).toBeVisible()

    // Read Privacy Notice link
    await page.getByRole('link', { name: /privacy notice/i }).click()
    await expect(page).toHaveURL(/.*privacy/)
    await expect(page.getByRole('heading', { name: /privacy notice/i })).toBeVisible()

    // Go back to Settings
    await page.goBack()
    await expect(page).toHaveURL(/.*settings/)

    // Admin logs out -> S1 Welcome
    await page.getByRole('button', { name: /logout/i }).click()
    await expect(page).toHaveURL(/\/(#.*)?$/)
    await expect(page.getByText('STAY IN TRACK')).toBeVisible()

    // ----------------------------------------------------
    // PART 2: Member Flow with dedicated disposable member
    // ----------------------------------------------------
    const memberEmail = `settings_member_${timestamp}_${testInfo.parallelIndex}@example.com`
    const memberPassword = 'MemberPassword123!'

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: gym } = await adminClient.from('gyms').select('id').limit(1).single()
    const gymId = gym!.id

    const { data: plan } = await adminClient
      .from('plans')
      .select('id')
      .eq('gym_id', gymId)
      .limit(1)
      .single()

    // Insert member record
    await adminClient
      .from('members')
      .insert({
        gym_id: gymId,
        full_name: 'Settings Test Member',
        email: memberEmail,
        plan_id: plan!.id,
        is_18_or_older: true,
        paid_until: '2026-11-15',
      })

    // Create auth user (handle_new_user trigger links member & creates profile)
    const { data: authUser, error: memberAuthErr } = await adminClient.auth.admin.createUser({
      email: memberEmail,
      password: memberPassword,
      email_confirm: true,
      user_metadata: {
        role: 'member',
        full_name: 'Settings Test Member',
        is_18_or_older: true,
      },
    })
    expect(memberAuthErr).toBeNull()
    expect(authUser.user).toBeTruthy()

    // Log in as the member
    await page.goto('/log-in')
    await page.getByLabel(/email/i).fill(memberEmail)
    await page.getByLabel(/^password$/i).fill(memberPassword)
    await page.getByRole('button', { name: /log in/i }).click()
    await expect(page).toHaveURL(/.*home/)

    // Navigate to Settings
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: /^settings$/i })).toBeVisible()
    await expect(page.getByText(memberEmail)).toBeVisible()

    // Member sees "Payment reminders" toggle
    const toggle = page.getByRole('switch', { name: /payment reminders/i })
    await expect(toggle).toBeVisible()
    await expect(toggle).toBeChecked()

    // Click the label (which wraps the sr-only checkbox) to trigger onChange
    const toggleLabel = page.getByText(/payment reminders/i)

    // Switch toggle off
    await toggleLabel.click()
    await expect(page.getByText('Reminders turned off')).toBeVisible()
    await expect(toggle).not.toBeChecked()

    // Switch toggle on
    await toggleLabel.click()
    await expect(page.getByText('Reminders turned on')).toBeVisible()
    await expect(toggle).toBeChecked()

    // Member deletes account
    await page.getByRole('button', { name: /delete account/i }).click()

    // ConfirmModal appears
    await expect(page.getByRole('heading', { name: /delete account/i })).toBeVisible()
    await expect(page.getByText(/this will delete your login/i)).toBeVisible()

    // Confirm deletion
    const confirmBtn = page.getByRole('button', { name: /^delete$/i })
    await confirmBtn.click()

    // User is redirected to S1 Welcome
    await expect(page).toHaveURL(/\/(#.*)?$/, { timeout: 10000 })
    await expect(page.getByText('STAY IN TRACK')).toBeVisible()
  })
})
