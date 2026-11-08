import { describe, it, expect } from 'vitest'
import { validateGraceDays } from '../../src/lib/rules/grace'
import { messages } from '../../src/lib/messages'

describe('Grace period validation rules (T-BR4-3)', () => {
  it('T-BR4-3 accepts 0 and 14, rejects 15, -1, empty and non-numeric', () => {
    expect(validateGraceDays(0)).toBeNull()
    expect(validateGraceDays(3)).toBeNull()
    expect(validateGraceDays(14)).toBeNull()
    expect(validateGraceDays('0')).toBeNull()
    expect(validateGraceDays('14')).toBeNull()

    expect(validateGraceDays(-1)).toEqual(messages.graceError)
    expect(validateGraceDays(15)).toEqual(messages.graceError)
    expect(validateGraceDays('')).toEqual(messages.graceError)
    expect(validateGraceDays('abc')).toEqual(messages.graceError)
    expect(validateGraceDays(NaN)).toEqual(messages.graceError)
    expect(validateGraceDays(null as unknown as number)).toEqual(messages.graceError)
    expect(validateGraceDays(undefined as unknown as number)).toEqual(messages.graceError)
  })
})

