/**
 * T-BR10-1 / T-BR10-2 — Reminder notice rules.
 * "Payment due soon" shows only when reminders are ON and paid_until is today to today + 3 days.
 * Grace period and Overdue notices show regardless of reminder setting.
 */
import { describe, it, expect } from 'vitest'
import { shouldShowDueSoon, shouldShowGraceBanner, shouldShowOverdueBanner } from '../../src/lib/reminders'

describe('T-BR10-1 shouldShowDueSoon', () => {
  it('shows when reminders ON and paid_until is today', () => {
    expect(shouldShowDueSoon(true, '2026-11-10', '2026-11-10')).toBe(true)
  })

  it('shows when reminders ON and paid_until is 3 days away', () => {
    expect(shouldShowDueSoon(true, '2026-11-13', '2026-11-10')).toBe(true)
  })

  it('does NOT show on day 4 (4 days away)', () => {
    expect(shouldShowDueSoon(true, '2026-11-14', '2026-11-10')).toBe(false)
  })

  it('does NOT show when reminders are OFF', () => {
    expect(shouldShowDueSoon(false, '2026-11-10', '2026-11-10')).toBe(false)
  })

  it('does NOT show when paid_until is null', () => {
    expect(shouldShowDueSoon(true, null, '2026-11-10')).toBe(false)
  })

  it('does NOT show when paid_until is in the past', () => {
    expect(shouldShowDueSoon(true, '2026-11-09', '2026-11-10')).toBe(false)
  })
})

describe('T-BR10-2 shouldShowGraceBanner — independent of reminders setting', () => {
  it('shows when status is grace regardless of reminders on', () => {
    expect(shouldShowGraceBanner('grace', true)).toBe(true)
  })

  it('shows when status is grace regardless of reminders off', () => {
    expect(shouldShowGraceBanner('grace', false)).toBe(true)
  })

  it('does NOT show when status is active', () => {
    expect(shouldShowGraceBanner('active', true)).toBe(false)
  })

  it('does NOT show when status is overdue', () => {
    expect(shouldShowGraceBanner('overdue', false)).toBe(false)
  })
})

describe('T-BR10-2 shouldShowOverdueBanner — independent of reminders setting', () => {
  it('shows when status is overdue regardless of reminders on', () => {
    expect(shouldShowOverdueBanner('overdue', true)).toBe(true)
  })

  it('shows when status is overdue regardless of reminders off', () => {
    expect(shouldShowOverdueBanner('overdue', false)).toBe(true)
  })

  it('does NOT show when status is active', () => {
    expect(shouldShowOverdueBanner('active', true)).toBe(false)
  })

  it('does NOT show when status is grace', () => {
    expect(shouldShowOverdueBanner('grace', false)).toBe(false)
  })
})

