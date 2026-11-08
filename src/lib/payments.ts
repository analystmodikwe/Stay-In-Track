/**
 * Business rules for Payments (BR5, BR6):
 * - calculateNewPaidUntil (BR5)
 * - canUndo (BR6)
 */

/**
 * Calculates new paid_until date (BR5):
 * New paid_until = (the later of old paid_until and payment_date) + months.
 * Clamps to the last day of target month if needed (e.g. 31 Jan + 1 month = 28 Feb).
 */
export function calculateNewPaidUntil(
  currentPaidUntil: string | null,
  paymentDate: string,
  months: number
): string {
  // Determine base date
  const baseDateStr =
    currentPaidUntil && currentPaidUntil >= paymentDate
      ? currentPaidUntil
      : paymentDate

  const [yearStr, monthStr, dayStr] = baseDateStr.substring(0, 10).split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10) - 1 // 0-based
  const day = parseInt(dayStr, 10)

  const totalMonths = month + months
  const targetYear = year + Math.floor(totalMonths / 12)
  const targetMonth = ((totalMonths % 12) + 12) % 12

  // Find last day of target month
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate()
  const targetDay = Math.min(day, daysInTargetMonth)

  const pad = (n: number) => String(n).padStart(2, '0')
  return `${targetYear}-${pad(targetMonth + 1)}-${pad(targetDay)}`
}

/**
 * Checks if a payment can be undone (BR6):
 * Only the latest Payment of a Member can be undone, and only within 24 hours of recording it.
 */
export function canUndo(
  payment: { id: string; created_at: string },
  latestPaymentId: string,
  now: Date = new Date()
): boolean {
  if (payment.id !== latestPaymentId) {
    return false
  }

  const createdAt = new Date(payment.created_at).getTime()
  const currentTime = now.getTime()
  const diffMs = currentTime - createdAt

  // 24 hours in milliseconds
  const twentyFourHoursMs = 24 * 60 * 60 * 1000
  return diffMs >= 0 && diffMs <= twentyFourHoursMs
}

