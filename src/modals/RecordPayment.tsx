import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { TextField } from '../components/TextField'
import { SelectField } from '../components/SelectField'
import { Button } from '../components/Button'
import { OfflineBanner } from '../components/OfflineBanner'
import { formatDate, todaySAST } from '../lib/format'
import { calculateNewPaidUntil } from '../lib/payments'
import { validatePaymentForm } from '../lib/rules/payment'
import { recordPayment } from '../lib/api/payments'
import { messages } from '../lib/messages'
import { useOnline } from '../hooks/useOnline'

interface RecordPaymentModalProps {
  isOpen: boolean
  member: {
    id: string
    full_name: string
    plan_id: string
    plan_price: number
    paid_until: string | null
    status?: string
  }
  onClose: () => void
  onSuccess: () => void
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  member,
  onClose,
  onSuccess,
}) => {
  const [months, setMonths] = useState<number>(1)
  const [amount, setAmount] = useState<number>(member.plan_price || 350)
  const [method, setMethod] = useState<string>('Cash')
  const [paymentDate, setPaymentDate] = useState<string>(todaySAST())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const isOnline = useOnline()
  const isOffline = !isOnline

  useEffect(() => {
    if (isOpen) {
      setMonths(1)
      setAmount(member.plan_price || 350)
      setMethod('Cash')
      setPaymentDate(todaySAST())
      setErrors({})
      setGeneralError(null)
    }
  }, [isOpen, member.plan_price])

  if (!isOpen) return null

  // Calculate new paid until date live
  const newPaidUntilDate = calculateNewPaidUntil(
    member.paid_until,
    paymentDate,
    months
  )

  const handleMonthsChange = (val: string) => {
    const parsed = parseInt(val, 10) || 1
    setMonths(parsed)
    setAmount((member.plan_price || 350) * parsed)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isOffline) return

    const validation = validatePaymentForm(
      {
        months,
        amount,
        method,
        paymentDate,
      },
      todaySAST()
    )

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)
    setGeneralError(null)

    const res = await recordPayment({
      memberId: member.id,
      months,
      amount,
      method,
      paymentDate,
    })

    setLoading(false)

    if (res.error) {
      if (res.error === messages.sessionExpired) {
        window.location.href = '/log-in'
        return
      }
      setGeneralError(res.error)
      return
    }

    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-[12px] max-w-[480px] w-full overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#CBD5E1]">
          <h2 className="text-[18px] font-semibold text-[#111827]">Record payment</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#4B5563] hover:text-[#111827] focus:outline-none"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Banner */}
        <OfflineBanner />

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4">
          {generalError && (
            <div className="p-3 bg-red-50 text-red-700 text-[14px] rounded-[8px]">
              {generalError}
            </div>
          )}

          {/* Months paid */}
          <SelectField
            label="Months paid"
            value={String(months)}
            onChange={(e) => handleMonthsChange(e.target.value)}
            error={errors.months}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
              <option key={m} value={String(m)}>
                {m} {m === 1 ? 'month' : 'months'}
              </option>
            ))}
          </SelectField>

          {/* Amount (R) */}
          <TextField
            label="Amount (R)"
            type="number"
            step="0.01"
            value={isNaN(amount) ? '' : amount}
            onChange={(e) => {
              setAmount(parseFloat(e.target.value))
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }))
            }}
            error={errors.amount}
          />

          {/* Payment method */}
          <SelectField
            label="Payment method"
            value={method}
            onChange={(e) => {
              setMethod(e.target.value)
              if (errors.method) setErrors((prev) => ({ ...prev, method: '' }))
            }}
            error={errors.method}
          >
            <option value="Cash">Cash</option>
            <option value="EFT">EFT</option>
            <option value="Card">Card</option>
          </SelectField>

          {/* Payment date */}
          <TextField
            label="Payment date"
            type="date"
            value={paymentDate}
            onChange={(e) => {
              setPaymentDate(e.target.value)
              if (errors.paymentDate) setErrors((prev) => ({ ...prev, paymentDate: '' }))
            }}
            error={errors.paymentDate}
          />

          {/* Live preview pill */}
          <div className="flex items-center justify-center p-3 bg-[#E3F4E6] text-[#1B5E20] rounded-[8px] text-[14px] font-medium">
            New paid until date: {formatDate(newPaidUntilDate)}
          </div>

          {/* Save payment button */}
          <div className="mt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || isOffline}
              loading={loading}
              className="w-full h-12"
            >
              Save payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RecordPaymentModal

