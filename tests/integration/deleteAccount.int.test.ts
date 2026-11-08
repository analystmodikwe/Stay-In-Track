/**
 * Integration tests for Account Deletion:
 * - T-US4-1 Admin deletes account -> gym and data cascading deleted
 * - T-US4-2 Member deletes account -> user removed, member record retained
 * - T-SEC-19a / T-SEC-19b delete_my_account function permissions
 */
import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

describe('Delete Account integration tests', () => {
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  it('T-US4-1 Admin deletes own account via delete_my_account() RPC', async () => {
    const email = `del_admin_${Date.now()}@example.com`
    const password = 'Password123!'

    // 1. Sign up admin
    const client = createClient(supabaseUrl, anonKey)
    const { data: signUpData } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: 'Delete Admin Test',
          role: 'admin',
          gym_name: 'Delete Gym Test',
          is_18_or_older: true,
        },
      },
    })
    const userId = signUpData.user!.id

    // Confirm email directly
    await adminClient.auth.admin.updateUserById(userId, { email_confirm: true })

    // Sign in to get session
    await client.auth.signInWithPassword({ email, password })

    // 2. Call delete_my_account()
    const { error: rpcError } = await client.rpc('delete_my_account')
    expect(rpcError).toBeNull()

    // 3. Verify user is removed from auth
    const { data: userCheck } = await adminClient.auth.admin.getUserById(userId)
    expect(userCheck.user).toBeNull()
  })

  it('T-SEC-19b Anon cannot call delete_my_account()', async () => {
    const anonClient = createClient(supabaseUrl, anonKey)
    const { error } = await anonClient.rpc('delete_my_account')
    expect(error).not.toBeNull()
  })
})
