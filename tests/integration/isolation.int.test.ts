/**
 * T-REL-3 Multi-Gym Isolation Integration Test
 * Verifies that two distinct gyms are strictly isolated:
 * - Admin A sees ONLY Gym A's Plans, Members, and Payments.
 * - Admin B sees ONLY Gym B's Plans, Members, and Payments.
 * - Calling list_members and get_dashboard only queries rows within the caller's gym.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

describe('T-REL-3 Multi-Gym Isolation (Two-Gym Test)', () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''

  let serviceClient: SupabaseClient
  let clientA: SupabaseClient
  let clientB: SupabaseClient

  const timestamp = Date.now()
  const password = 'TestPassword123!'

  const emailA = `admin_a_${timestamp}@example.com`
  const emailB = `admin_b_${timestamp}@example.com`

  let userIdA: string
  let userIdB: string
  let gymIdA: string
  let gymIdB: string

  let planIdA: string
  let planIdB: string
  let memberIdA: string
  let memberIdB: string

  beforeAll(async () => {
    serviceClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // 1. Create Admin A (triggers gym creation via handle_new_user)
    const { data: userA, error: errA } = await serviceClient.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        full_name: 'Admin Alpha',
        gym_name: `Gym Alpha ${timestamp}`,
        is_18_or_older: true,
      },
    })
    expect(errA).toBeNull()
    userIdA = userA.user!.id

    // 2. Create Admin B (triggers gym creation via handle_new_user)
    const { data: userB, error: errB } = await serviceClient.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        full_name: 'Admin Beta',
        gym_name: `Gym Beta ${timestamp}`,
        is_18_or_older: true,
      },
    })
    expect(errB).toBeNull()
    userIdB = userB.user!.id

    // Fetch created gym IDs from profiles
    const { data: profA } = await serviceClient.from('profiles').select('gym_id').eq('id', userIdA).single()
    const { data: profB } = await serviceClient.from('profiles').select('gym_id').eq('id', userIdB).single()
    gymIdA = profA!.gym_id
    gymIdB = profB!.gym_id

    expect(gymIdA).not.toBe(gymIdB)

    // 3. Create Plans in Gym A and Gym B
    const { data: pA } = await serviceClient.from('plans').insert({
      gym_id: gymIdA,
      name: `Plan Alpha ${timestamp}`,
      price: 300,
      status: 'active',
    }).select().single()
    planIdA = pA!.id

    const { data: pB } = await serviceClient.from('plans').insert({
      gym_id: gymIdB,
      name: `Plan Beta ${timestamp}`,
      price: 500,
      status: 'active',
    }).select().single()
    planIdB = pB!.id

    // 4. Create Members in Gym A and Gym B
    const { data: mA } = await serviceClient.from('members').insert({
      gym_id: gymIdA,
      full_name: 'Member Alpha',
      email: `member_a_${timestamp}@example.com`,
      plan_id: planIdA,
      is_18_or_older: true,
      paid_until: '2026-11-30',
    }).select().single()
    memberIdA = mA!.id

    const { data: mB } = await serviceClient.from('members').insert({
      gym_id: gymIdB,
      full_name: 'Member Beta',
      email: `member_b_${timestamp}@example.com`,
      plan_id: planIdB,
      is_18_or_older: true,
      paid_until: '2026-11-30',
    }).select().single()
    memberIdB = mB!.id

    // 5. Create Payments in Gym A and Gym B
    await serviceClient.from('payments').insert({
      gym_id: gymIdA,
      member_id: memberIdA,
      amount: 300,
      method: 'Cash',
      months: 1,
      payment_date: '2026-10-28',
      recorded_by: userIdA,
    })

    await serviceClient.from('payments').insert({
      gym_id: gymIdB,
      member_id: memberIdB,
      amount: 500,
      method: 'EFT',
      months: 1,
      payment_date: '2026-10-28',
      recorded_by: userIdB,
    })

    // 6. Sign in authenticated clients
    clientA = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { error: signInErrA } = await clientA.auth.signInWithPassword({
      email: emailA,
      password,
    })
    expect(signInErrA).toBeNull()

    clientB = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { error: signInErrB } = await clientB.auth.signInWithPassword({
      email: emailB,
      password,
    })
    expect(signInErrB).toBeNull()
  })

  afterAll(async () => {
    // Delete the two test gyms and users cleanly via admin API
    if (userIdA) await serviceClient.auth.admin.deleteUser(userIdA)
    if (userIdB) await serviceClient.auth.admin.deleteUser(userIdB)
    if (gymIdA) await serviceClient.from('gyms').delete().eq('id', gymIdA)
    if (gymIdB) await serviceClient.from('gyms').delete().eq('id', gymIdB)
  })

  it('T-REL-3a: Admin A sees only Gym A plans; Admin B sees only Gym B plans', async () => {
    const { data: plansA, error: errA } = await clientA.from('plans').select('id, name')
    expect(errA).toBeNull()
    const planIdsA = plansA!.map(p => p.id)
    expect(planIdsA).toContain(planIdA)
    expect(planIdsA).not.toContain(planIdB)

    const { data: plansB, error: errB } = await clientB.from('plans').select('id, name')
    expect(errB).toBeNull()
    const planIdsB = plansB!.map(p => p.id)
    expect(planIdsB).toContain(planIdB)
    expect(planIdsB).not.toContain(planIdA)
  })

  it('T-REL-3b: Admin A sees only Gym A members; Admin B sees only Gym B members', async () => {
    const { data: membersA, error: errA } = await clientA.from('members').select('id, full_name')
    expect(errA).toBeNull()
    const memberIdsA = membersA!.map(m => m.id)
    expect(memberIdsA).toContain(memberIdA)
    expect(memberIdsA).not.toContain(memberIdB)

    const { data: membersB, error: errB } = await clientB.from('members').select('id, full_name')
    expect(errB).toBeNull()
    const memberIdsB = membersB!.map(m => m.id)
    expect(memberIdsB).toContain(memberIdB)
    expect(memberIdsB).not.toContain(memberIdA)
  })

  it('T-REL-3c: Admin A sees only Gym A payments; Admin B sees only Gym B payments', async () => {
    const { data: paymentsA, error: errA } = await clientA.from('payments').select('id, member_id, amount')
    expect(errA).toBeNull()
    const memberIdsInPaymentsA = paymentsA!.map(p => p.member_id)
    expect(memberIdsInPaymentsA).toContain(memberIdA)
    expect(memberIdsInPaymentsA).not.toContain(memberIdB)

    const { data: paymentsB, error: errB } = await clientB.from('payments').select('id, member_id, amount')
    expect(errB).toBeNull()
    const memberIdsInPaymentsB = paymentsB!.map(p => p.member_id)
    expect(memberIdsInPaymentsB).toContain(memberIdB)
    expect(memberIdsInPaymentsB).not.toContain(memberIdA)
  })

  it('T-REL-3d: RPC list_members isolates members strictly per gym', async () => {
    const { data: listA, error: errA } = await clientA.rpc('list_members', {
      p_search: null,
      p_status: null,
      p_cursor: null,
      p_today: '2026-10-28',
    })
    expect(errA).toBeNull()
    const idsA = (listA || []).map((m: { id: string }) => m.id)
    expect(idsA).toContain(memberIdA)
    expect(idsA).not.toContain(memberIdB)

    const { data: listB, error: errB } = await clientB.rpc('list_members', {
      p_search: null,
      p_status: null,
      p_cursor: null,
      p_today: '2026-10-28',
    })
    expect(errB).toBeNull()
    const idsB = (listB || []).map((m: { id: string }) => m.id)
    expect(idsB).toContain(memberIdB)
    expect(idsB).not.toContain(memberIdA)
  })

  it('T-REL-3e: RPC get_dashboard calculates stats strictly for the caller gym', async () => {
    const { data: dashA, error: errA } = await clientA.rpc('get_dashboard', {
      p_today: '2026-10-28',
    })
    expect(errA).toBeNull()
    expect(dashA.total).toBe(1)
    expect(dashA.revenue_this_month).toBe(300)

    const { data: dashB, error: errB } = await clientB.rpc('get_dashboard', {
      p_today: '2026-10-28',
    })
    expect(errB).toBeNull()
    expect(dashB.total).toBe(1)
    expect(dashB.revenue_this_month).toBe(500)
  })
})
