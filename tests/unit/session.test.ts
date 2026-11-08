/**
 * T-AUTH-2  30-day session sign-out check (PRD Section 5)
 * The app signs out sessions older than 30 days on startup.
 * Newer sessions are kept.
 */
import { describe, it, expect } from 'vitest'
import { isSessionTooOld } from '../../src/lib/rules/session'

const MS_PER_DAY = 24 * 60 * 60 * 1000

function makeSession(ageDays: number, baseNow: number) {
  const createdAt = Math.floor((baseNow - ageDays * MS_PER_DAY) / 1000)
  return { created_at: createdAt } as unknown as Parameters<typeof isSessionTooOld>[0]
}

describe('T-AUTH-2 session age check', () => {
  const baseNow = 1700000000000

  it('T-AUTH-2a keeps a session that is exactly 30 days old', () => {
    expect(isSessionTooOld(makeSession(30, baseNow), baseNow)).toBe(false)
  })

  it('T-AUTH-2b keeps a session that is 1 day old', () => {
    expect(isSessionTooOld(makeSession(1, baseNow), baseNow)).toBe(false)
  })

  it('T-AUTH-2c signs out a session that is 31 days old', () => {
    expect(isSessionTooOld(makeSession(31, baseNow), baseNow)).toBe(true)
  })

  it('T-AUTH-2d signs out a session that is 90 days old', () => {
    expect(isSessionTooOld(makeSession(90, baseNow), baseNow)).toBe(true)
  })

  it('T-AUTH-2e keeps a session with no created_at field', () => {
    expect(isSessionTooOld({} as Parameters<typeof isSessionTooOld>[0], baseNow)).toBe(false)
  })
})
