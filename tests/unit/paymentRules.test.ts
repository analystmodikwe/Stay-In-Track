/**
 * Unit tests for Payment input validation rules:
 * - T-BR5-7 (BR5)
 */
import { describe, it, expect } from 'vitest'
import {
  validateMonths,
  validateAmount,
  validateMethod,
  validatePaymentDate,
  validatePaymentForm,
} from '../../src/lib/rules/payment'

describe('Payment input validation (T-BR5-7, BR5)', () => {
  it('validates months (1 to 12)', () => {
    expect(validateMonths(1).valid).toBe(true)
    expect(validateMonths(6).valid).toBe(true)
    expect(validateMonths(12).valid).toBe(true)

    expect(validateMonths(0).valid).toBe(false)
    expect(validateMonths(0).error).toBe('Choose the number of months.')

    expect(validateMonths(13).valid).toBe(false)
    expect(validateMonths(13).error).toBe('Choose the number of months.')

    expect(validateMonths(null as unknown as number).valid).toBe(false)
    expect(validateMonths(null as unknown as number).error).toBe('Choose the number of months.')
  })

  it('validates amount (between R1.00 and R50,000.00)', () => {
    expect(validateAmount(1).valid).toBe(true)
    expect(validateAmount(350).valid).toBe(true)
    expect(validateAmount(50000).valid).toBe(true)

    expect(validateAmount(0.99).valid).toBe(false)
    expect(validateAmount(0.99).error).toBe('Amount must be between R1.00 and R50,000.00.')

    expect(validateAmount(50000.01).valid).toBe(false)
    expect(validateAmount(50000.01).error).toBe('Amount must be between R1.00 and R50,000.00.')

    expect(validateAmount(0).valid).toBe(false)
    expect(validateAmount(-100).valid).toBe(false)
  })

  it('validates method (Cash, EFT, Card)', () => {
    expect(validateMethod('Cash').valid).toBe(true)
    expect(validateMethod('EFT').valid).toBe(true)
    expect(validateMethod('Card').valid).toBe(true)

    expect(validateMethod('Bitcoin').valid).toBe(false)
    expect(validateMethod('Bitcoin').error).toBe('Choose a payment method.')

    expect(validateMethod('').valid).toBe(false)
    expect(validateMethod('').error).toBe('Choose a payment method.')
  })

  it('validates payment date (not in future in SAST)', () => {
    const today = '2026-10-28'

    expect(validatePaymentDate('2026-10-28', today).valid).toBe(true)
    expect(validatePaymentDate('2026-10-27', today).valid).toBe(true)
    expect(validatePaymentDate('2026-09-01', today).valid).toBe(true)

    expect(validatePaymentDate('2026-10-29', today).valid).toBe(false)
    expect(validatePaymentDate('2026-10-29', today).error).toBe("Payment date can't be in the future.")

    expect(validatePaymentDate('', today).valid).toBe(false)
    expect(validatePaymentDate('', today).error).toBe('Choose a payment date.')
  })

  it('validates entire form', () => {
    const today = '2026-10-28'
    const valid = validatePaymentForm(
      {
        months: 1,
        amount: 350,
        method: 'Cash',
        paymentDate: '2026-10-28',
      },
      today
    )
    expect(valid.isValid).toBe(true)
    expect(Object.keys(valid.errors)).toHaveLength(0)

    const invalid = validatePaymentForm(
      {
        months: 0,
        amount: 0,
        method: '',
        paymentDate: '2026-10-29',
      },
      today
    )
    expect(invalid.isValid).toBe(false)
    expect(invalid.errors.months).toBe('Choose the number of months.')
    expect(invalid.errors.amount).toBe('Amount must be between R1.00 and R50,000.00.')
    expect(invalid.errors.method).toBe('Choose a payment method.')
    expect(invalid.errors.paymentDate).toBe("Payment date can't be in the future.")
  })
})

