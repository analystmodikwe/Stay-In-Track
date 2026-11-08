/**
 * EmptyState — icon, text, and optional action button.
 * T-C-6
 */
import React from 'react'
import type { LucideIcon } from 'lucide-react'

export interface EmptyStateProps {
  icon: LucideIcon
  text: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, text, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
      <Icon
        size={48}
        className="text-text-secondary"
        aria-hidden="true"
        strokeWidth={1.5}
      />
      <p className="text-body text-text-secondary">{text}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className={[
            'inline-flex items-center justify-center gap-2',
            'min-h-[48px] rounded-button px-6',
            'bg-primary text-white text-body font-semibold',
            'hover:bg-[#162d4c] transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          ].join(' ')}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

