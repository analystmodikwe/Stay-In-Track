/**
 * Unit tests for Revenue calculation (BR7, T-BR7-2):
 * - Only payments dated in current SAST month count
 * - Formatted as "R1,350.00"
 */
import { describe, it, expect } from 'vitest'
import { calculateRevenueThisMonth, formatRevenue } from '../../src/lib/revenue'

describe('calculateRevenueThisMonth (T-BR7-2, BR7)', () => {
  it('sums only payments in the current calendar month in SAST', () => {
    // Current SAST today: 2026-10-28
    const today = '2026-10-28'

    const payments = [
      { amount: 350, payment_date: '2026-10-01' }, // October -> includes
      { amount: 550, payment_date: '2026-10-15' }, // October -> includes
      { amount: 450, payment_date: '2026-10-28' }, // October -> includes
      { amount: 350, payment_date: '2026-09-30' }, // September -> excluded
      { amount: 350, payment_date: '2026-11-01' }, // November -> excluded
    ]

    const total = calculateRevenueThisMonth(payments, today)
    expect(total).toBe(1350)
    expect(formatRevenue(total)).toBe('R1,350.00')
  })

  it('returns 0 when there are no payments in the current month', () => {
    const today = '2026-10-28'
    const payments = [
      { amount: 350, payment_date: '2026-09-15' },
    ]

    const total = calculateRevenueThisMonth(payments, today)
    expect(total).toBe(0)
    expect(formatRevenue(total)).toBe('R0.00')
  })
})

