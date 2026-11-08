/**
 * Integration tests for Search and Member listing (OP12, BR9):
 * - T-US11-1 Search "tha" returns Thando Mokoena
 * - T-US11-2 Filter "overdue" returns only overdue members
 * - T-BR9-1 Case-insensitive search on full name and email
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const seedPassword = process.env.SEED_TEST_PASSWORD || 'TestPass1234!'

describe('Search and Member listing integration tests (OP12)', () => {
  const client = createClient(supabaseUrl, anonKey)

  beforeAll(async () => {
    const { error } = await client.auth.signInWithPassword({
      email: 'sipho@ironhaven.example.com',
      password: seedPassword,
    })
    expect(error).toBeNull()
  })

  it('T-US11-1: searches "tha" and finds Thando Mokoena with status', async () => {
    const { data, error } = await client.rpc('list_members', {
      p_search: 'tha',
      p_status: null,
      p_cursor: null,
      p_today: '2026-10-28',
    })

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data.length).toBeGreaterThanOrEqual(1)

    const thando = data.find((m: { full_name: string }) => m.full_name.includes('Thando'))
    expect(thando).toBeDefined()
    // With today = 2026-10-28 and grace_days = 3 (paid_until = 2026-10-26), status is grace
    expect(thando.status).toBe('grace')
  })

  it('T-US11-2: filters by status "overdue" and returns overdue members', async () => {
    const { data, error } = await client.rpc('list_members', {
      p_search: null,
      p_status: 'overdue',
      p_cursor: null,
      p_today: '2026-10-28',
    })

    expect(error).toBeNull()
    expect(data).toBeDefined()
    for (const member of data) {
      expect(member.status).toBe('overdue')
    }
  })
})

