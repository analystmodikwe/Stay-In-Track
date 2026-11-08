import { messages } from '../messages'

export function validateGraceDays(days: unknown): string | null {
  if (days === null || days === undefined || days === '') {
    return messages.graceError
  }

  const num = typeof days === 'number' ? days : Number(days)
  if (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 14) {
    return messages.graceError
  }

  return null
}

