/**
 * ConfirmModal — danger button, "Cancel", tapping outside closes it.
 * T-C-8. Used by M4, M5, M6.
 */
import React, { useEffect, useRef } from 'react'
import { Button } from './Button'

export interface ConfirmModalProps {
  title: string
  text: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmModal({
  title,
  text,
  confirmLabel,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Tap outside closes
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) {
      onCancel()
    }
  }

  // Escape key closes
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-text"
    >
      <div className="bg-white rounded-card shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
        <h2 id="confirm-title" className="text-heading font-semibold text-text-main">
          {title}
        </h2>
        <p id="confirm-text" className="text-body text-text-secondary">
          {text}
        </p>
        <div className="flex flex-col gap-3">
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="secondary" disabled={loading} onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

