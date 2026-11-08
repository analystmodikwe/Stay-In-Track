/**
 * TextField — normal, focused (teal ring), error (red border + message).
 * Password variant shows an eye icon to toggle visibility (PRD S2, T-C-2).
 */
import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function TextField({
  label,
  error,
  hint,
  type,
  id,
  className = '',
  ...props
}: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  const errorId = `${inputId}-error`
  const hintId  = `${inputId}-hint`

  const describedBy = [
    error ? errorId : '',
    hint  ? hintId  : '',
  ].filter(Boolean).join(' ') || undefined

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-text-main"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={[
            'w-full rounded-input border px-3 py-3 text-body',
            'bg-white text-text-main placeholder-text-secondary',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            error
              ? 'border-error focus-visible:ring-error'
              : 'border-border',
            isPassword ? 'pr-11' : '',
          ].join(' ')}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(v => !v)}
            className={[
              'absolute right-3 top-1/2 -translate-y-1/2',
              'text-text-secondary hover:text-text-main',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded',
              'min-h-[44px] min-w-[44px] flex items-center justify-center',
            ].join(' ')}
          >
            {showPassword
              ? <EyeOff size={20} aria-hidden="true" />
              : <Eye     size={20} aria-hidden="true" />}
          </button>
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-small text-error">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-small text-text-secondary">
          {hint}
        </p>
      )}
    </div>
  )
}

