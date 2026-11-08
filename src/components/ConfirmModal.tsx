/**
 * ConfirmModal — danger button, "Cancel", tapping outside closes it.
 * T-C-8. Used by M4, M5, M6.
 */
import React, { useEffect, useRef } from 'react'
import { Button } from './Button'

export interface ConfirmModalProps {
  title: string
  /** Either a plain string or rich ReactNode (for M4 which includes OfflineBanner) */
  text?: string
  body?: React.ReactNode
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  /** Alias for loading — used by DeleteAccount */
  confirmLoading?: boolean
  /** Disables the confirm button independently of loading */
  confirmDisabled?: boolean
  /** When false the modal is not rendered at all */
  isOpen?: boolean
}

export function ConfirmModal({
  title,
  text,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
  loading = false,
  confirmLoading,
  confirmDisabled,
  isOpen = true,
}: ConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const isLoading  = confirmLoading ?? loading
  const isDisabled = confirmDisabled ?? false

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

  if (!isOpen) return null

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
        {/* Body: prefer ReactNode (body), fall back to text string */}
        <div id="confirm-text" className="text-body text-text-secondary">
          {body ?? <p>{text}</p>}
        </div>
        <div className="flex flex-col gap-3">
          <Button
            variant="danger"
            loading={isLoading}
            disabled={isDisabled || isLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button variant="secondary" disabled={isLoading} onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
