/**
 * Button — primary, secondary (outlined) and danger variants.
 * Always 48px tall (PRD 9.1, T-C-1).
 */
import React from 'react'
import { Loader2 } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  children: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white border border-primary hover:bg-[#162d4c] active:bg-[#162d4c] ' +
    'disabled:bg-[#9ca3af] disabled:border-[#9ca3af] disabled:cursor-not-allowed',
  secondary:
    'bg-white text-primary border border-primary hover:bg-[#f0f4f9] active:bg-[#f0f4f9] ' +
    'disabled:text-[#9ca3af] disabled:border-[#9ca3af] disabled:cursor-not-allowed',
  danger:
    'bg-error text-white border border-error hover:bg-[#a21a1a] active:bg-[#a21a1a] ' +
    'disabled:bg-[#9ca3af] disabled:border-[#9ca3af] disabled:cursor-not-allowed',
}

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      aria-busy={loading}
      className={[
        'inline-flex items-center justify-center gap-2',
        'w-full rounded-button',
        'min-h-[48px] px-4',
        'text-body font-semibold',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {loading && (
        <Loader2
          size={20}
          className="animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}

