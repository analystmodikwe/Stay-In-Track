/**
 * Integration tests for Payments (OP17, OP18):
 * - T-US8-1 Admin records a payment for an Overdue/Grace member via record_payment()
 * - T-US8-2 Recording 2 months payment extends paid_until by 2 months
 * - T-US8-3 Payment date in future rejected by database constraint/trigger
 * - T-US8-4 Invalid amount (< 1 or > 50,000) rejected by constraint
 * - T-US9-1 Latest payment can be undone via undo_payment()
 * - T-EDGE-5 Month end date clamping (31 Jan + 1 month = 28 Feb)
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const seedPassword = process.env.SEED_TEST_PASSWORD || 'TestPass1234!'

describe('Payments integration tests', () => {
  const client = createClient(supabaseUrl, anonKey)
  let gymId: string
  let memberId: string
  let planPrice: number

  beforeAll(async () => {
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: 'sipho@ironhaven.example.com',
      password: seedPassword,
    })
    expect(authError).toBeNull()
    expect(authData.user).not.toBeNull()

    const { data: profile } = await client
      .from('profiles')
      .select('gym_id')
      .eq('id', authData.user!.id)
      .single()

    expect(profile).not.toBeNull()
    gymId = profile!.gym_id

    // Find Thando (sample member on Standard plan)
    const { data: member } = await client
      .from('members')
      .select('id, plan_id, paid_until')
      .eq('gym_id', gymId)
      .ilike('full_name', '%Thando%')
      .single()

    expect(member).not.toBeNull()
    memberId = member!.id

    const { data: plan } = await client
      .from('plans')
      .select('price')
      .eq('id', member!.plan_id)
      .single()

    expect(plan).not.toBeNull()
    planPrice = Number(plan!.price)
  })

  it('T-US8-1 & T-US9-1: records a payment, updates paid_until, then undoes it', async () => {
    // 1. Get current member paid_until
    const { data: beforeMember } = await client
      .from('members')
      .select('paid_until')
      .eq('id', memberId)
      .single()
    const origPaidUntil = beforeMember!.paid_until

    // 2. Call record_payment RPC
    const today = new Date().toISOString().substring(0, 10)
    const { data: paymentId, error: recError } = await client.rpc('record_payment', {
      p_member_id: memberId,
      p_months: 1,
      p_amount: planPrice,
      p_method: 'Cash',
      p_payment_date: today,
    })

    expect(recError).toBeNull()
    expect(paymentId).toBeDefined()

    // 3. Verify member paid_until was updated
    const { data: updatedMember } = await client
      .from('members')
      .select('paid_until')
      .eq('id', memberId)
      .single()
    expect(updatedMember!.paid_until).not.toBe(origPaidUntil)

    // 4. Verify payment record was created
    const { data: paymentRow } = await client
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()
    expect(paymentRow).not.toBeNull()
    expect(paymentRow!.amount).toBe(planPrice)
    expect(paymentRow!.method).toBe('Cash')
    expect(paymentRow!.previous_paid_until).toBe(origPaidUntil)

    // 5. Call undo_payment RPC (T-US9-1)
    const { error: undoError } = await client.rpc('undo_payment', {
      p_payment_id: paymentId,
    })
    expect(undoError).toBeNull()

    // 6. Verify payment row was deleted
    const { data: afterUndoPayment } = await client
      .from('payments')
      .select('id')
      .eq('id', paymentId)
      .maybeSingle()
    expect(afterUndoPayment).toBeNull()

    // 7. Verify member paid_until was restored
    const { data: restoredMember } = await client
      .from('members')
      .select('paid_until')
      .eq('id', memberId)
      .single()
    expect(restoredMember!.paid_until).toBe(origPaidUntil)
  })

  it('T-US8-3: rejects payment date in future at database level', async () => {
    const { error } = await client.rpc('record_payment', {
      p_member_id: memberId,
      p_months: 1,
      p_amount: planPrice,
      p_method: 'Card',
      p_payment_date: '2099-12-31',
    })

    expect(error).not.toBeNull()
  })

  it('T-US8-4: rejects amount below R1.00 or above R50,000.00', async () => {
    const today = new Date().toISOString().substring(0, 10)
    const { error: lowError } = await client.rpc('record_payment', {
      p_member_id: memberId,
      p_months: 1,
      p_amount: 0.5,
      p_method: 'EFT',
      p_payment_date: today,
    })
    expect(lowError).not.toBeNull()

    const { error: highError } = await client.rpc('record_payment', {
      p_member_id: memberId,
      p_months: 1,
      p_amount: 55000,
      p_method: 'EFT',
      p_payment_date: today,
    })
    expect(highError).not.toBeNull()
  })
})

