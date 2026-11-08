/**
 * Integration tests for Member dashboard and reminders (Phase 8):
 * - T-US13-1: Member reads own membership (OP21)
 * - T-US14-2: Member toggles payment reminders on/off (OP22)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

describe('Member integration tests (OP21, OP22)', () => {
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const memberClient = createClient(supabaseUrl, anonKey)

  const memberEmail = `int_member_${Date.now()}@example.com`
  const memberPassword = 'Password123!'
  let gymId: string
  let planId: string
  let createdMemberId: string
  let memberUserId: string

  beforeAll(async () => {
    // 1. Get gym and active plan from admin
    const { data: adminProfile } = await adminClient
      .from('profiles')
      .select('gym_id')
      .eq('email', 'sipho@ironhaven.example.com')
      .single()

    expect(adminProfile).not.toBeNull()
    gymId = adminProfile!.gym_id

    const { data: plans } = await adminClient
      .from('plans')
      .select('id')
      .eq('gym_id', gymId)
      .eq('status', 'active')
      .limit(1)

    expect(plans && plans.length > 0).toBe(true)
    planId = plans![0].id

    // 2. Pre-add member row (Admin OP9)
    const { data: memberRow, error: memberErr } = await adminClient
      .from('members')
      .insert({
        gym_id: gymId,
        full_name: 'Integration Member',
        email: memberEmail,
        plan_id: planId,
        is_18_or_older: true,
      })
      .select('id')
      .single()

    expect(memberErr).toBeNull()
    createdMemberId = memberRow!.id

    // 3. Member signs up with this email
    const { data: signUpData, error: signUpErr } = await memberClient.auth.signUp({
      email: memberEmail,
      password: memberPassword,
      options: {
        data: {
          full_name: 'Integration Member',
          role: 'member',
          is_18_or_older: true,
        },
      },
    })

    expect(signUpErr).toBeNull()
    memberUserId = signUpData.user!.id

    // 4. Confirm member's email directly
    await adminClient.auth.admin.updateUserById(memberUserId, {
      email_confirm: true,
    })

    // 5. Sign in as member
    const { data: signInData, error: signInErr } = await memberClient.auth.signInWithPassword({
      email: memberEmail,
      password: memberPassword,
    })

    expect(signInErr).toBeNull()
    expect(signInData.session).not.toBeNull()
  })

  afterAll(async () => {
    await memberClient.auth.signOut()
    if (memberUserId) {
      await adminClient.auth.admin.deleteUser(memberUserId)
    }
    if (createdMemberId) {
      await adminClient.from('members').delete().eq('id', createdMemberId)
    }
  })

  it('T-US13-1 Member reads own membership details with RLS', async () => {
    // Member queries own record
    const { data: member, error: memberError } = await memberClient
      .from('members')
      .select('id, full_name, email, paid_until, plans(*), gyms(*)')
      .eq('user_id', memberUserId)
      .single()

    expect(memberError).toBeNull()
    expect(member).not.toBeNull()
    expect(member!.full_name).toBe('Integration Member')
    expect(member!.email).toBe(memberEmail)
    expect(member!.plans).not.toBeNull()
    expect(member!.gyms).not.toBeNull()
  })

  it('T-US14-2 Member toggles reminders on/off (OP22)', async () => {
    // 1. Initially reminders_on defaults to true
    const { data: prof1 } = await memberClient
      .from('profiles')
      .select('reminders_on')
      .eq('id', memberUserId)
      .single()

    expect(prof1?.reminders_on).toBe(true)

    // 2. Turn reminders off
    const { error: updErr1 } = await memberClient
      .from('profiles')
      .update({ reminders_on: false })
      .eq('id', memberUserId)

    expect(updErr1).toBeNull()

    const { data: prof2 } = await memberClient
      .from('profiles')
      .select('reminders_on')
      .eq('id', memberUserId)
      .single()

    expect(prof2?.reminders_on).toBe(false)

    // 3. Turn reminders back on
    const { error: updErr2 } = await memberClient
      .from('profiles')
      .update({ reminders_on: true })
      .eq('id', memberUserId)

    expect(updErr2).toBeNull()

    const { data: prof3 } = await memberClient
      .from('profiles')
      .select('reminders_on')
      .eq('id', memberUserId)
      .single()

    expect(prof3?.reminders_on).toBe(true)
  })
})

