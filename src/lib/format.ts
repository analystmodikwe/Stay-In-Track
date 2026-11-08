/**
 * Format utilities — rand, date and phone in SAST / South African style.
 * PRD 12.1: dates like "28 Oct 2026"; money like "R1,350.00"; phone "+27 82 555 0147".
 * T-NFR-9.
 */

const SAST_TIMEZONE = 'Africa/Johannesburg'

/** Format a money amount as "R1,350.00". */
export function formatMoney(amount: number): string {
  const parts = Number(amount || 0).toFixed(2).split('.')
  const integerWithCommas = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `R${integerWithCommas}.${parts[1]}`
}

/**
 * Format an ISO date string as "28 Oct 2026" (SAST).
 * Accepts "YYYY-MM-DD" or a full ISO string.
 */
export function formatDate(isoDate: string): string {
  // Parse as a date-only value (no timezone shift for calendar dates)
  const [year, month, day] = isoDate.substring(0, 10).split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: SAST_TIMEZONE,
  }).format(d)
}

/**
 * Format a +27XXXXXXXXX phone number as "+27 82 555 0147".
 * Splits after the country code (+27), then in groups of 2-2-4.
 * If the number doesn't match the expected format, returns it as-is.
 */
export function formatPhone(phone: string): string {
  const match = phone.match(/^\+27(\d{2})(\d{3})(\d{4})$/)
  if (!match) return phone
  return `+27 ${match[1]} ${match[2]} ${match[3]}`
}

/**
 * Remove spaces from a phone number before saving.
 * "+27 82 555 0147" → "+27825550147"
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, '')
}

/** Return "today" in SAST as a "YYYY-MM-DD" string. */
export function todaySAST(): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: SAST_TIMEZONE,
  }).format(new Date())
}

