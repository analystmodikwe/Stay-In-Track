/**
 * Toast — dark background, disappears after 3 s.
 * T-C-4. The queue is managed by useToast.
 */
import React, { useEffect, useState } from 'react'

export interface ToastProps {
  text: string
  onDismiss?: () => void
  /** Duration in ms. Default 3000. */
  duration?: number
}

export function Toast({ text, onDismiss, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      onDismiss?.()
    }, duration)
    return () => clearTimeout(t)
  }, [duration, onDismiss])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'bg-[#111827] text-white',
        'rounded-button px-4 py-3',
        'text-body shadow-lg',
        'max-w-sm w-max',
      ].join(' ')}
    >
      {text}
    </div>
  )
}

