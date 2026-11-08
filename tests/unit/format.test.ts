import { describe, it, expect } from 'vitest'
import {
  formatMoney,
  formatDate,
  formatPhone,
  normalizePhone,
  todaySAST,
  formatTimeSAST,
  formatDateTimeSAST,
} from '../../src/lib/format'

describe('Format utilities (T-NFR-9)', () => {
  it('formats money as R1,350.00', () => {
    expect(formatMoney(1350)).toBe('R1,350.00')
    expect(formatMoney(250)).toBe('R250.00')
    expect(formatMoney(0)).toBe('R0.00')
    expect(formatMoney(1234567.89)).toBe('R1,234,567.89')
  })

  it('formats dates as "28 Oct 2026" in SAST', () => {
    expect(formatDate('2026-10-28')).toBe('28 Oct 2026')
    expect(formatDate('2026-11-15')).toBe('15 Nov 2026')
    expect(formatDate('2026-01-05')).toMatch(/^(0?5) Jan 2026$/)
  })

  it('formats phone numbers as +27 82 555 0147', () => {
    expect(formatPhone('+27825550147')).toBe('+27 82 555 0147')
    expect(formatPhone('+27112345678')).toBe('+27 11 234 5678')
    expect(formatPhone('invalid')).toBe('invalid')
  })

  it('normalizes phone numbers by stripping whitespace', () => {
    expect(normalizePhone('+27 82 555 0147')).toBe('+27825550147')
  })

  it('provides today in SAST as YYYY-MM-DD', () => {
    expect(todaySAST()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('formats 24-hour time in SAST (e.g. "14:30")', () => {
    // 2026-10-28T12:30:00Z is 14:30 in SAST (UTC+2)
    const isoUtc = '2026-10-28T12:30:00Z'
    expect(formatTimeSAST(isoUtc)).toBe('14:30')
  })

  it('formats date and 24-hour time in SAST (e.g. "28 Oct 2026, 14:30")', () => {
    const isoUtc = '2026-10-28T12:30:00Z'
    expect(formatDateTimeSAST(isoUtc)).toBe('28 Oct 2026, 14:30')
  })
})
