/**
 * Reminders and Notice rules (BR10, PRD 4.5)
 * - Due soon: shown only when reminders are ON and paid_until is between today and today + 3 days.
 * - Grace banner: shown when status is 'grace' (independent of reminder setting).
 * - Overdue banner: shown when status is 'overdue' (independent of reminder setting).
 */

function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.substring(0, 10).split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export function shouldShowDueSoon(
  remindersOn: boolean,
  paidUntil: string | null | undefined,
  today: string
): boolean {
  if (!remindersOn || !paidUntil) return false
  const paid = paidUntil.substring(0, 10)
  if (paid < today) return false

  const dPaid = parseDateOnly(paid)
  const dToday = parseDateOnly(today)
  const diffMs = dPaid.getTime() - dToday.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= 3
}

export function shouldShowGraceBanner(
  status: 'active' | 'grace' | 'overdue',
  _remindersOn: boolean
): boolean {
  return status === 'grace'
}

export function shouldShowOverdueBanner(
  status: 'active' | 'grace' | 'overdue',
  _remindersOn: boolean
): boolean {
  return status === 'overdue'
}

export function calculateLastGraceDay(paidUntil: string, graceDays: number): string {
  const d = parseDateOnly(paidUntil)
  d.setUTCDate(d.getUTCDate() + graceDays)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

