import { describe, it, expect } from 'vitest'
import {
  validateMemberName,
  validateMemberEmail,
  validateMemberPhone,
  validateMember,
} from '../../src/lib/rules/member'
import { normalizePhone } from '../../src/lib/format'

describe('Member validation rules (T-BR2-4)', () => {
  it('T-BR2-4a validates member name (length 2-60)', () => {
    expect(validateMemberName('A')).toBe('Enter a name of 2 to 60 characters.')
    expect(validateMemberName('A'.repeat(61))).toBe('Enter a name of 2 to 60 characters.')
    expect(validateMemberName('')).toBe('Enter a name of 2 to 60 characters.')
    expect(validateMemberName('Naledi Khumalo')).toBeNull()
  })

  it('T-BR2-4b validates member email (valid format, max 100 chars)', () => {
    expect(validateMemberEmail('invalid')).toBe('Enter a valid email address.')
    expect(validateMemberEmail('')).toBe('Enter a valid email address.')
    expect(validateMemberEmail('a'.repeat(95) + '@test.com')).toBe('Email can be up to 100 characters.')
    expect(validateMemberEmail('naledi.k@example.com')).toBeNull()
  })

  it('T-BR2-4c validates member phone (+27 followed by 9 digits, spaces allowed on input)', () => {
    // Phone is optional
    expect(validateMemberPhone('')).toBeNull()
    expect(validateMemberPhone(null)).toBeNull()
    expect(validateMemberPhone(undefined)).toBeNull()

    // Valid formats
    expect(validateMemberPhone('+27821234567')).toBeNull()
    expect(validateMemberPhone('+27 82 555 0147')).toBeNull()
    expect(normalizePhone('+27 82 555 0147')).toBe('+27825550147')

    // Invalid formats (e.g. 082 prefix or wrong length)
    expect(validateMemberPhone('0821234567')).toBe('Phone must start with +27 followed by 9 digits.')
    expect(validateMemberPhone('+2712345678')).toBe('Phone must start with +27 followed by 9 digits.')
    expect(validateMemberPhone('+271234567890')).toBe('Phone must start with +27 followed by 9 digits.')
  })

  it('T-BR2-4d validates full member object including 18-or-older checkbox', () => {
    const invalid = validateMember({
      full_name: 'A',
      email: 'bad',
      phone: '082',
      plan_id: '',
      is_18_or_older: false,
    })

    expect(invalid.isValid).toBe(false)
    expect(invalid.errors.full_name).toBe('Enter a name of 2 to 60 characters.')
    expect(invalid.errors.email).toBe('Enter a valid email address.')
    expect(invalid.errors.phone).toBe('Phone must start with +27 followed by 9 digits.')
    expect(invalid.errors.plan_id).toBe('Choose a Plan.')
    expect(invalid.errors.is_18_or_older).toBe('You must confirm the Member is 18 or older.')

    const valid = validateMember({
      full_name: 'Thando Mokoena',
      email: 'thando.m@example.com',
      phone: '+27 82 555 0147',
      plan_id: 'plan-123',
      is_18_or_older: true,
    })

    expect(valid.isValid).toBe(true)
    expect(valid.errors).toEqual({})
  })
})

