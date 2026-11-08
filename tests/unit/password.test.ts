/**
 * T-AUTH-1  Password validation rules (PRD Section 5)
 * Rule: at least 8 characters AND at least 1 number.
 */
import { describe, it, expect } from 'vitest'
import { validatePassword } from '../../src/lib/rules/password'

describe('T-AUTH-1 validatePassword', () => {
  it('T-AUTH-1a passes for 8+ chars with a number', () => {
    expect(validatePassword('abcdefg1')).toBe(true)
    expect(validatePassword('MyPass1word')).toBe(true)
    expect(validatePassword('12345678')).toBe(true)
  })

  it('T-AUTH-1b fails when there is no number', () => {
    expect(validatePassword('abcdefgh')).toBe(false)
    expect(validatePassword('Password')).toBe(false)
  })

  it('T-AUTH-1c fails when shorter than 8 characters', () => {
    expect(validatePassword('abc1')).toBe(false)
    expect(validatePassword('a1b2c3d')).toBe(false)
  })

  it('T-AUTH-1d fails for empty string', () => {
    expect(validatePassword('')).toBe(false)
  })
})

