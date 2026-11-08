import React, { useState } from 'react'
import { Button } from '../components/Button'
import { OfflineBanner } from '../components/OfflineBanner'
import { formatDate } from '../lib/format'
import { undoPayment } from '../lib/api/payments'

interface UndoPaymentModalProps {
  isOpen: boolean
  payment: {
    id: string
    previous_paid_until?: string | null
  } | null
  onClose: () => void
  onSuccess: () => void
}

export const UndoPaymentModal: React.FC<UndoPaymentModalProps> = ({
  isOpen,
  payment,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !payment) return null

  const description = payment.previous_paid_until
    ? `The paid until date goes back to ${formatDate(payment.previous_paid_until)}.`
    : 'The Member goes back to No Payment yet.'

  const handleConfirm = async () => {
    if (!navigator.onLine) return

    setLoading(true)
    setError(null)

    const res = await undoPayment(payment.id)
    setLoading(false)

    if (res.error) {
      setError(res.error)
      return
    }

    onSuccess()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[12px] max-w-[400px] w-full p-6 shadow-xl flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <OfflineBanner />

        <h3 className="text-[18px] font-semibold text-[#111827]">
          Undo this Payment?
        </h3>

        <p className="text-[14px] text-[#4B5563]">{description}</p>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-[14px] rounded-[8px]">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            loading={loading}
            disabled={loading || !navigator.onLine}
            className="flex-1"
          >
            Undo Payment
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UndoPaymentModal

