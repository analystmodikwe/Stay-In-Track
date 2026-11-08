/**
 * Integration tests for Auth flows:
 * - T-US1-1 Admin sign-up
 * - T-US1-2 Duplicate email
 * - T-US2-1 Log in
 * - T-US2-2 Unverified email
 * - T-US2-3 Forgot password
 * - T-INT-1 Log out ends session
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

describe('Auth integration tests', () => {
  const client = createClient(supabaseUrl, anonKey)
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const testEmail = `test_admin_${Date.now()}@example.com`
  const testPassword = 'Password123!'

  beforeAll(async () => {
    // Clean up if exists
    const { data: users } = await adminClient.auth.admin.listUsers()
    const existing = users?.users?.find(u => u.email === testEmail)
    if (existing) {
      await adminClient.auth.admin.deleteUser(existing.id)
    }
  })

  it('T-US1-1 Admin sign-up creates user in auth', async () => {
    const { data, error } = await client.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Integration Admin',
          role: 'admin',
          gym_name: 'Integration Gym',
          is_18_or_older: true,
        },
      },
    })

    expect(error).toBeNull()
    expect(data.user).not.toBeNull()
    expect(data.user?.email).toBe(testEmail)
  })

  it('T-US1-2 Duplicate email sign-up returns error or existing user indication', async () => {
    const { data, error } = await client.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Duplicate Admin',
          role: 'admin',
          gym_name: 'Duplicate Gym',
          is_18_or_older: true,
        },
      },
    })

    // In Supabase, depending on email confirmations, duplicate sign up either errors or returns empty/null identities
    const isDuplicate = error !== null || data.user?.identities?.length === 0
    expect(isDuplicate).toBe(true)
  })

  it('T-US2-2 Unverified user log in returns email not confirmed error', async () => {
    const { data, error } = await client.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    expect(data.session).toBeNull()
    expect(error?.message).toMatch(/confirm/i)
  })

  it('T-US2-1 Verified Admin logs in successfully', async () => {
    // Manually verify user using admin client
    const { data: users } = await adminClient.auth.admin.listUsers()
    const user = users?.users?.find(u => u.email === testEmail)
    if (user) {
      await adminClient.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      })
    }

    const { data, error } = await client.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    expect(error).toBeNull()
    expect(data.session).not.toBeNull()
    expect(data.user?.user_metadata.role).toBe('admin')
  })

  it('T-INT-1 Log out ends the session', async () => {
    const { error } = await client.auth.signOut()
    expect(error).toBeNull()

    const { data } = await client.auth.getSession()
    expect(data.session).toBeNull()
  })

  it('T-US2-3 Forgot password sends reset email without revealing existence', async () => {
    const { error } = await client.auth.resetPasswordForEmail('nonexistent_random_user@example.com')
    expect(error).toBeNull()
  })

  it('T-US3-1 & T-US3-2 can_sign_up_as_member RPC checks member pre-registration', async () => {
    // Unlinked seeded member johan.vdm@example.com can sign up
    const { data: canSignUp, error: rpcError } = await client.rpc('can_sign_up_as_member', {
      email: 'johan.vdm@example.com',
    })

    expect(rpcError).toBeNull()
    expect(canSignUp).toBe(true)

    // Unknown email cannot sign up
    const { data: cannotSignUp, error: rpcError2 } = await client.rpc('can_sign_up_as_member', {
      email: 'unknown_nonexistent_email@example.com',
    })

    expect(rpcError2).toBeNull()
    expect(cannotSignUp).toBe(false)
  })
})
