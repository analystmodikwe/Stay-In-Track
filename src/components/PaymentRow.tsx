import React from 'react'
import { formatDate, formatMoney } from '../lib/format'
import { Button } from './Button'

export interface PaymentItem {
  id: string
  amount: number
  method: string
  months: number
  payment_date: string
  created_at: string
  previous_paid_until?: string | null
}

interface PaymentRowProps {
  payment: PaymentItem
  canUndo?: boolean
  onUndo?: () => void
}

export const PaymentRow: React.FC<PaymentRowProps> = ({
  payment,
  canUndo = false,
  onUndo,
}) => {
  const monthsText = `${payment.months} ${payment.months === 1 ? 'month' : 'months'}`

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-[#CBD5E1] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[16px] text-[#111827]">
            {formatMoney(payment.amount)}
          </span>
          <span className="text-[14px] text-[#4B5563]">•</span>
          <span className="text-[14px] text-[#4B5563]">{payment.method}</span>
          <span className="text-[14px] text-[#4B5563]">•</span>
          <span className="text-[14px] text-[#4B5563]">{monthsText}</span>
        </div>
        <div className="text-[13px] text-[#4B5563]">
          {formatDate(payment.payment_date)}
        </div>
      </div>

      {canUndo && (
        <Button
          variant="secondary"
          onClick={onUndo}
          className="h-9 px-3 text-[14px]"
        >
          Undo
        </Button>
      )}
    </div>
  )
}

export default PaymentRow
