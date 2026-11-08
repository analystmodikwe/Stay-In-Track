import { describe, it, expect } from 'vitest'
import { calculateMemberStatus, getTodaySast } from '../../src/lib/status'

describe('Member status calculation (T-BR3-2)', () => {
  const today = '2026-10-28'

  it('T-BR3-2a paid until today or later is Active', () => {
    expect(calculateMemberStatus('2026-10-28', 3, today)).toBe('active')
    expect(calculateMemberStatus('2026-10-29', 3, today)).toBe('active')
    expect(calculateMemberStatus('2026-11-15', 3, today)).toBe('active')
  })

  it('T-BR3-2b within grace days is Grace period', () => {
    // 3 grace days: last grace day is paid_until + 3 days counted in
    // paid 27 Oct + 3 = 30 Oct -> grace
    expect(calculateMemberStatus('2026-10-27', 3, today)).toBe('grace')
    // paid 26 Oct (Thando) + 3 = 29 Oct -> grace
    expect(calculateMemberStatus('2026-10-26', 3, today)).toBe('grace')
    // paid 25 Oct + 3 = 28 Oct (today) -> grace
    expect(calculateMemberStatus('2026-10-25', 3, today)).toBe('grace')
    // on 29 Oct, paid until 25 Oct is overdue
    expect(calculateMemberStatus('2026-10-25', 3, '2026-10-29')).toBe('overdue')
  })

  it('T-BR3-2c past grace period or no paid_until is Overdue', () => {
    // paid 24 Oct + 3 = 27 Oct (yesterday) -> overdue
    expect(calculateMemberStatus('2026-10-24', 3, today)).toBe('overdue')
    expect(calculateMemberStatus('2026-10-10', 3, today)).toBe('overdue')
    expect(calculateMemberStatus(null, 3, today)).toBe('overdue')
  })

  it('T-BR3-2d with 0 grace days, paid until yesterday is overdue immediately', () => {
    expect(calculateMemberStatus('2026-10-27', 0, today)).toBe('overdue')
    expect(calculateMemberStatus('2026-10-28', 0, today)).toBe('active')
  })

  it('T-BR3-2e SAST day boundary: 23:30 UTC on 27 Oct is 28 Oct in SAST (UTC+2)', () => {
    const d = new Date('2026-10-27T23:30:00.000Z')
    expect(getTodaySast(d)).toBe('2026-10-28')
  })
})

