/**
 * Integration tests for Members:
 * - T-US5-1 Admin adds a Member
 * - T-US5-2 Duplicate Member email in same gym rejected
 * - T-US6-1 Admin updates a Member
 * - T-US6-2 Admin deletes a Member
 * - T-INT-2 Get Member with Payments
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const seedPassword = process.env.SEED_TEST_PASSWORD || 'TestPassword123!'

describe('Members integration tests', () => {
  const client = createClient(supabaseUrl, anonKey)
  let gymId: string
  let planId: string
  let createdMemberId: string

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

    const { data: plan } = await client
      .from('plans')
      .select('id')
      .eq('gym_id', gymId)
      .eq('status', 'active')
      .limit(1)
      .single()

    expect(plan).not.toBeNull()
    planId = plan!.id
  })

  afterAll(async () => {
    if (createdMemberId) {
      await client.from('members').delete().eq('id', createdMemberId)
    }
    await client.auth.signOut()
  })

  it('T-US5-1 Admin adds a Member', async () => {
    const memberEmail = `member_${Date.now()}@example.com`
    const { data: member, error } = await client
      .from('members')
      .insert({
        gym_id: gymId,
        full_name: 'Integration Member',
        email: memberEmail,
        phone: '+27821112222',
        plan_id: planId,
        is_18_or_older: true,
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(member).not.toBeNull()
    expect(member.full_name).toBe('Integration Member')
    expect(member.email).toBe(memberEmail)
    createdMemberId = member.id
  })

  it('T-US5-2 Duplicate Member email in same gym is rejected', async () => {
    // naledi.k@example.com already exists in Iron Haven Gym
    const { error } = await client
      .from('members')
      .insert({
        gym_id: gymId,
        full_name: 'Naledi Duplicate',
        email: 'naledi.k@example.com',
        plan_id: planId,
        is_18_or_older: true,
      })

    expect(error).not.toBeNull()
    expect(error?.message).toMatch(/unique|duplicate/i)
  })

  it('T-US6-1 Admin updates a Member (e.g. phone)', async () => {
    const newPhone = '+27823334444'
    const { data: updated, error } = await client
      .from('members')
      .update({ phone: newPhone })
      .eq('id', createdMemberId)
      .select()
      .single()

    expect(error).toBeNull()
    expect(updated.phone).toBe(newPhone)
  })

  it('T-INT-2 Get Member with Payments (OP13)', async () => {
    const { data, error } = await client
      .from('members')
      .select('*, plans(*), payments(*)')
      .eq('id', createdMemberId)
      .single()

    expect(error).toBeNull()
    expect(data.id).toBe(createdMemberId)
    expect(data.plans).not.toBeNull()
  })

  it('T-US6-2 Admin deletes a Member', async () => {
    const { error } = await client
      .from('members')
      .delete()
      .eq('id', createdMemberId)

    expect(error).toBeNull()

    const { data: found } = await client
      .from('members')
      .select('id')
      .eq('id', createdMemberId)
      .maybeSingle()

    expect(found).toBeNull()
    createdMemberId = ''
  })
})

