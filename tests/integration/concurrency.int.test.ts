import { describe, it, expect, beforeAll } from 'vitest'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

describe('Concurrency & Last-Write-Wins (T-EDGE-8)', () => {
  let adminClient: SupabaseClient
  let testGymId: string
  let testMemberId: string

  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  beforeAll(async () => {
    adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Find or create test gym
    let { data: gym } = await adminClient.from('gyms').select('id').limit(1).maybeSingle()
    if (!gym) {
      const { data: newGym } = await adminClient
        .from('gyms')
        .insert({ name: 'Concurrency Gym', grace_days: 3 })
        .select('id')
        .single()
      gym = newGym
    }
    testGymId = gym!.id

    // Find or create an active plan
    let { data: plan } = await adminClient
      .from('plans')
      .select('id')
      .eq('gym_id', testGymId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (!plan) {
      const { data: newPlan } = await adminClient
        .from('plans')
        .insert({
          gym_id: testGymId,
          name: `Concurrency Plan ${Date.now()}`,
          price: 350,
          status: 'active',
        })
        .select('id')
        .single()
      plan = newPlan
    }

    // Create a dedicated member for concurrency test
    const { data: member } = await adminClient
      .from('members')
      .insert({
        gym_id: testGymId,
        full_name: 'Concurrency Initial Name',
        email: `concurrency_${Date.now()}@example.com`,
        plan_id: plan!.id,
        is_18_or_older: true,
        paid_until: '2026-11-15',
      })
      .select()
      .single()

    testMemberId = member!.id
  })

  it('T-EDGE-8 Two Admin sessions edit the same Member; last saved version wins and both see it after refresh', async () => {
    // Session 1 client and Session 2 client
    const session1 = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const session2 = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Both sessions read current member
    const { data: m1 } = await session1.from('members').select().eq('id', testMemberId).single()
    const { data: m2 } = await session2.from('members').select().eq('id', testMemberId).single()
    expect(m1?.full_name).toBe('Concurrency Initial Name')
    expect(m2?.full_name).toBe('Concurrency Initial Name')

    // Session 1 updates first
    const { error: err1 } = await session1
      .from('members')
      .update({ full_name: 'Concurrency Edit From Admin 1' })
      .eq('id', testMemberId)
    expect(err1).toBeNull()

    // Session 2 updates second (last write)
    const { error: err2 } = await session2
      .from('members')
      .update({ full_name: 'Concurrency Edit From Admin 2' })
      .eq('id', testMemberId)
    expect(err2).toBeNull()

    // Both sessions refresh / re-query
    const { data: refreshed1 } = await session1.from('members').select().eq('id', testMemberId).single()
    const { data: refreshed2 } = await session2.from('members').select().eq('id', testMemberId).single()

    // Last saved version wins
    expect(refreshed1?.full_name).toBe('Concurrency Edit From Admin 2')
    expect(refreshed2?.full_name).toBe('Concurrency Edit From Admin 2')
  })
})
