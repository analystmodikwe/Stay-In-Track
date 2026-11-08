/**
 * Revenue utilities (BR7).
 * Revenue this month = sum of Payment amounts whose payment date is in the current calendar month in SAST.
 */
import { formatMoney, todaySAST } from './format'

export interface PaymentRevenueItem {
  amount: number
  payment_date: string
}

export function calculateRevenueThisMonth(
  payments: PaymentRevenueItem[],
  today: string = todaySAST()
): number {
  const currentMonth = today.substring(0, 7) // "YYYY-MM"
  return payments
    .filter((p) => p.payment_date && p.payment_date.substring(0, 7) === currentMonth)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
}

export function formatRevenue(amount: number): string {
  return formatMoney(amount)
}

