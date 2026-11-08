import { normalizePhone } from '../format'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+27[0-9]{9}$/

export function validateMemberName(name: string): string | null {
  if (!name || name.trim().length < 2 || name.trim().length > 60) {
    return 'Enter a name of 2 to 60 characters.'
  }
  return null
}

export function validateMemberEmail(email: string): string | null {
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return 'Enter a valid email address.'
  }
  if (email.trim().length > 100) {
    return 'Email can be up to 100 characters.'
  }
  return null
}

export function validateMemberPhone(phone?: string | null): string | null {
  if (!phone || phone.trim() === '') {
    return null
  }
  const normalized = normalizePhone(phone)
  if (!PHONE_REGEX.test(normalized)) {
    return 'Phone must start with +27 followed by 9 digits.'
  }
  return null
}

export interface MemberValidationResult {
  isValid: boolean
  errors: {
    full_name?: string
    email?: string
    phone?: string
    plan_id?: string
    is_18_or_older?: string
  }
}

export function validateMember(data: {
  full_name: string
  email: string
  phone?: string | null
  plan_id?: string | null
  is_18_or_older?: boolean
}): MemberValidationResult {
  const errors: MemberValidationResult['errors'] = {}

  const nameError = validateMemberName(data.full_name)
  if (nameError) errors.full_name = nameError

  const emailError = validateMemberEmail(data.email)
  if (emailError) errors.email = emailError

  const phoneError = validateMemberPhone(data.phone)
  if (phoneError) errors.phone = phoneError

  if (!data.plan_id) {
    errors.plan_id = 'Choose a Plan.'
  }

  if (!data.is_18_or_older) {
    errors.is_18_or_older = 'You must confirm the Member is 18 or older.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

