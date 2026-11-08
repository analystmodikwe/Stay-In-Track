/**
 * Password validation rule (PRD Section 5, T-AUTH-1)
 * At least 8 characters AND at least one number.
 */
export function validatePassword(password: string): boolean {
  if (password.length < 8) return false
  if (!/\d/.test(password)) return false
  return true
}

