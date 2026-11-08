/**
 * Validation rules for recording a payment (BR5).
 */
import { messages } from '../messages'
import { todaySAST } from '../format'

export type PaymentMethod = 'Cash' | 'EFT' | 'Card'

export interface PaymentFormValues {
  months: number
  amount: number
  method: string
  paymentDate: string
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateMonths(months: number): ValidationResult {
  if (!months || isNaN(months) || months < 1 || months > 12) {
    return { valid: false, error: messages.monthsError }
  }
  return { valid: true }
}

export function validateAmount(amount: number): ValidationResult {
  if (isNaN(amount) || amount < 1 || amount > 50000) {
    return { valid: false, error: messages.amountError }
  }
  return { valid: true }
}

export function validateMethod(method: string): ValidationResult {
  if (!method || !['Cash', 'EFT', 'Card'].includes(method)) {
    return { valid: false, error: messages.methodError }
  }
  return { valid: true }
}

export function validatePaymentDate(date: string, today: string = todaySAST()): ValidationResult {
  if (!date || !date.trim()) {
    return { valid: false, error: 'Choose a payment date.' }
  }
  if (date > today) {
    return { valid: false, error: messages.futureDateError }
  }
  return { valid: true }
}

export function validatePaymentForm(
  values: PaymentFormValues,
  today: string = todaySAST()
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  const monthsRes = validateMonths(values.months)
  if (!monthsRes.valid && monthsRes.error) {
    errors.months = monthsRes.error
  }

  const amountRes = validateAmount(values.amount)
  if (!amountRes.valid && amountRes.error) {
    errors.amount = amountRes.error
  }

  const methodRes = validateMethod(values.method)
  if (!methodRes.valid && methodRes.error) {
    errors.method = methodRes.error
  }

  const dateRes = validatePaymentDate(values.paymentDate, today)
  if (!dateRes.valid && dateRes.error) {
    errors.paymentDate = dateRes.error
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
