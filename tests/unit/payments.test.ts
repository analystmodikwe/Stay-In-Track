/**
 * Unit tests for Payment calculation and undo rules:
 * - T-BR5-6 calculateNewPaidUntil (BR5)
 * - T-BR6-4 canUndo (BR6)
 */
import { describe, it, expect } from 'vitest'
import { calculateNewPaidUntil, canUndo } from '../../src/lib/payments'

describe('calculateNewPaidUntil (T-BR5-6, BR5)', () => {
  it('adds months to existing paid_until when member is active and paid_until is after payment date', () => {
    // Member paid until 15 Nov 2026, payment of 2 months dated 28 Oct 2026 → 15 Jan 2027
    const result = calculateNewPaidUntil('2026-11-15', '2026-10-28', 2)
    expect(result).toBe('2027-01-15')
  })

  it('adds months from payment date when member has no previous payment (paid_until is null)', () => {
    // Empty paid_until + 1 month dated 31 Jan 2027 → 28 Feb 2027
    const result = calculateNewPaidUntil(null, '2027-01-31', 1)
    expect(result).toBe('2027-02-28')
  })

  it('adds months from payment date when member is overdue (paid_until before payment date)', () => {
    // Overdue Member (10 Oct 2026) paid on 28 Oct 2026 for 1 month → 28 Nov 2026
    const result = calculateNewPaidUntil('2026-10-10', '2026-10-28', 1)
    expect(result).toBe('2026-11-28')
  })

  it('clamps day of month to end of target month (T-EDGE-5)', () => {
    // Payment on 31 Jan for 1 month → 28 Feb 2027 (in a non-leap year)
    const result = calculateNewPaidUntil(null, '2027-01-31', 1)
    expect(result).toBe('2027-02-28')

    // Leap year 2028: 31 Jan 2028 + 1 month → 29 Feb 2028
    const leapResult = calculateNewPaidUntil(null, '2028-01-31', 1)
    expect(leapResult).toBe('2028-02-29')

    // 31 Mar 2027 + 1 month → 30 Apr 2027
    const aprResult = calculateNewPaidUntil('2027-03-31', '2027-03-31', 1)
    expect(aprResult).toBe('2027-04-30')
  })
})

describe('canUndo (T-BR6-4, BR6)', () => {
  const baseTime = new Date('2026-10-28T14:00:00Z')

  it('returns true when payment is the latest and created 2 hours ago', () => {
    const payment = {
      id: 'pay-1',
      created_at: new Date('2026-10-28T12:00:00Z').toISOString(),
    }
    const result = canUndo(payment, 'pay-1', baseTime)
    expect(result).toBe(true)
  })

  it('returns false when payment is older than 24 hours (24h 1m old)', () => {
    const payment = {
      id: 'pay-1',
      created_at: new Date('2026-10-27T13:59:00Z').toISOString(),
    }
    const result = canUndo(payment, 'pay-1', baseTime)
    expect(result).toBe(false)
  })

  it('returns false when payment is not the latest payment', () => {
    const payment = {
      id: 'pay-1',
      created_at: new Date('2026-10-28T12:00:00Z').toISOString(),
    }
    // Latest payment is pay-2
    const result = canUndo(payment, 'pay-2', baseTime)
    expect(result).toBe(false)
  })
})

