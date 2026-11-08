/**
 * Integration tests for Admin Dashboard (OP20, BR3, BR7):
 * - T-US12-1 Sample data and today = 2026-10-28:
 *   Total Members 4, Active 2, Grace period 1, Overdue 1,
 *   Revenue this month "R1,350.00",
 *   Members per Plan Student 2, Standard 1, Premium 1
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const seedPassword = process.env.SEED_TEST_PASSWORD || 'TestPass1234!'

describe('Admin Dashboard integration tests (OP20)', () => {
  const client = createClient(supabaseUrl, anonKey)

  beforeAll(async () => {
    const { error } = await client.auth.signInWithPassword({
      email: 'sipho@ironhaven.example.com',
      password: seedPassword,
    })
    expect(error).toBeNull()

    const seedEmails = [
      'naledi.k@example.com',
      'johan.vdm@example.com',
      'thando.m@example.com',
      'ayesha.p@example.com',
    ]
    const { data: allMembers } = await client.from('members').select('id, email')
    if (allMembers) {
      const extra = allMembers.filter((m) => !seedEmails.includes(m.email))
      for (const m of extra) {
        await client.from('members').delete().eq('id', m.id)
      }
    }
  })

  it('T-US12-1: get_dashboard returns exact sample metrics for 2026-10-28', async () => {
    const { data, error } = await client.rpc('get_dashboard', {
      p_today: '2026-10-28',
    })

    expect(error).toBeNull()
    expect(data).toBeDefined()

    expect(data.total).toBe(4)
    expect(data.active).toBe(2)
    expect(data.grace).toBe(1)
    expect(data.overdue).toBe(1)
    expect(Number(data.revenue)).toBe(1350)

    // Plans
    expect(data.plans).toBeDefined()
    const student = data.plans.find((p: { name: string }) => p.name === 'Student')
    const standard = data.plans.find((p: { name: string }) => p.name === 'Standard')
    const premium = data.plans.find((p: { name: string }) => p.name === 'Premium')

    expect(student?.count).toBe(2)
    expect(standard?.count).toBe(1)
    expect(premium?.count).toBe(1)

    // Overdue list
    expect(data.overdue_list).toBeDefined()
    expect(data.overdue_list.length).toBe(1)
    expect(data.overdue_list[0].full_name).toContain('Ayesha')
  })
})

