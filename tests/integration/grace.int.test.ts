/**
 * Integration tests for Grace period:
 * - T-US10-1 Admin changes grace_days
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const seedPassword = process.env.SEED_TEST_PASSWORD || 'TestPassword123!'

describe('Grace period integration tests', () => {
  const client = createClient(supabaseUrl, anonKey)
  let gymId: string

  beforeAll(async () => {
    const { data, error } = await client.auth.signInWithPassword({
      email: 'sipho@ironhaven.example.com',
      password: seedPassword,
    })
    expect(error).toBeNull()
    expect(data.user).not.toBeNull()

    const { data: profile } = await client
      .from('profiles')
      .select('gym_id')
      .eq('id', data.user!.id)
      .single()

    expect(profile).not.toBeNull()
    gymId = profile!.gym_id
  })

  afterAll(async () => {
    // Restore grace_days to 3
    if (gymId) {
      await client.from('gyms').update({ grace_days: 3 }).eq('id', gymId)
    }
    await client.auth.signOut()
  })

  it('T-US10-1 Admin updates Grace period on gyms table', async () => {
    const { error: updateError } = await client
      .from('gyms')
      .update({ grace_days: 5 })
      .eq('id', gymId)

    expect(updateError).toBeNull()

    const { data: gym, error: fetchError } = await client
      .from('gyms')
      .select('grace_days')
      .eq('id', gymId)
      .single()

    expect(fetchError).toBeNull()
    expect(gym!.grace_days).toBe(5)
  })
})

