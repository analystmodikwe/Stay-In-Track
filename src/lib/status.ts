export function getTodaySast(date = new Date()): string {
  // SAST is UTC+2
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(date)
}

function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.substring(0, 10).split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function formatDateOnly(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(dateStr: string, days: number): string {
  const d = parseDateOnly(dateStr)
  d.setUTCDate(d.getUTCDate() + days)
  return formatDateOnly(d)
}

export function calculateMemberStatus(
  paidUntil: string | null | undefined,
  graceDays: number,
  today: string = getTodaySast()
): 'active' | 'grace' | 'overdue' {
  if (!paidUntil) return 'overdue'

  const paidDate = paidUntil.substring(0, 10)
  if (paidDate >= today) {
    return 'active'
  }

  // Grace period: today <= paid_until + grace_days
  const lastGraceDay = addDays(paidDate, graceDays)
  if (today <= lastGraceDay) {
    return 'grace'
  }

  return 'overdue'
}

