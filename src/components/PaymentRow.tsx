/**
 * PaymentRow — date, amount, method, months; optional "Undo" button.
 * T-C-16.
 */
import React from 'react'
import { formatDate, formatMoney } from '../lib/format'

export interface PaymentRowProps {
  paymentDate: string   // ISO date string
  amount: number
  method: 'Cash' | 'EFT' | 'Card'
  months: number
  canUndo?: boolean
  onUndo?: () => void
}

export function PaymentRow({
  paymentDate,
  amount,
  method,
  months,
  canUndo = false,
  onUndo,
}: PaymentRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-border">
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-body text-text-main font-medium">
          {formatMoney(amount)}
        </p>
        <p className="text-small text-text-secondary">
          {formatDate(paymentDate)} &middot; {method} &middot; {months} month{months !== 1 ? 's' : ''}
        </p>
      </div>
      {canUndo && onUndo && (
        <button
          type="button"
          onClick={onUndo}
          className={[
            'flex-shrink-0 text-small font-medium text-error',
            'min-h-[44px] min-w-[44px] flex items-center justify-center',
            'hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded',
          ].join(' ')}
        >
          Undo
        </button>
      )}
    </div>
  )
}

