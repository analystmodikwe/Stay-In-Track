/**
 * Integration tests for Plans:
 * - T-US7-1 Admin creates and edits a Plan
 * - T-US7-2 Duplicate Plan name in the same gym rejected
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const seedPassword = process.env.SEED_TEST_PASSWORD || 'TestPassword123!'

describe('Plans integration tests', () => {
  const client = createClient(supabaseUrl, anonKey)
  let gymId: string
  let createdPlanId: string

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
    if (createdPlanId) {
      await client.from('plans').delete().eq('id', createdPlanId)
    }
    await client.auth.signOut()
  })

  it('T-US7-1 Admin creates and updates a Plan', async () => {
    const planName = `Cardio Plus ${Date.now()}`
    const { data: newPlan, error: insertError } = await client
      .from('plans')
      .insert({
        gym_id: gymId,
        name: planName,
        price: 420.0,
        benefits: 'Cardio equipment access',
        status: 'active',
      })
      .select()
      .single()

    expect(insertError).toBeNull()
    expect(newPlan).not.toBeNull()
    expect(newPlan.name).toBe(planName)
    expect(Number(newPlan.price)).toBe(420.0)
    createdPlanId = newPlan.id

    // Update status to inactive
    const { data: updatedPlan, error: updateError } = await client
      .from('plans')
      .update({ status: 'inactive' })
      .eq('id', createdPlanId)
      .select()
      .single()

    expect(updateError).toBeNull()
    expect(updatedPlan.status).toBe('inactive')
  })

  it('T-US7-2 Duplicate Plan name in same gym is rejected', async () => {
    // Standard already exists in seed data for Iron Haven Gym
    const { error } = await client
      .from('plans')
      .insert({
        gym_id: gymId,
        name: 'Standard',
        price: 350.0,
        benefits: 'Duplicate standard',
        status: 'active',
      })

    expect(error).not.toBeNull()
    expect(error?.message).toMatch(/unique|duplicate/i)
  })
})

