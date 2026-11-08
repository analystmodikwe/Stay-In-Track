/**
 * Header — back arrow or close icon, title, optional subtitle.
 * Hidden on S1. T-C-10.
 */
import React from 'react'
import { ArrowLeft, X } from 'lucide-react'

export interface HeaderProps {
  title: string
  subtitle?: string
  /** If provided, shows a back arrow that calls this function. */
  onBack?: () => void
  /** If provided, shows a close (X) icon that calls this function. */
  onClose?: () => void
}

export function Header({ title, subtitle, onBack, onClose }: HeaderProps) {
  const hasLeft = onBack || onClose

  return (
    <header
      className={[
        'w-full bg-primary text-white',
        'px-screen py-3',
        'flex items-center gap-3',
        'min-h-[56px]',
      ].join(' ')}
    >
      {hasLeft && (
        <div className="flex-shrink-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className={[
                'flex items-center justify-center',
                'min-h-[44px] min-w-[44px] -ml-2',
                'rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
              ].join(' ')}
            >
              <ArrowLeft size={24} aria-hidden="true" />
            </button>
          )}
          {!onBack && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={[
                'flex items-center justify-center',
                'min-h-[44px] min-w-[44px] -ml-2',
                'rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
              ].join(' ')}
            >
              <X size={24} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h1 className="text-heading font-semibold leading-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-small text-white/80 truncate">{subtitle}</p>
        )}
      </div>
    </header>
  )
}

