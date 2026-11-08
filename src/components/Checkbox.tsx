/**
 * Checkbox — labelled checkbox with optional error.
 * T-C-3
 */
import React from 'react'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode
  error?: string
}

export function Checkbox({ label, error, id, className = '', ...props }: CheckboxProps) {
  const checkId = id ?? `checkbox-${Math.random().toString(36).slice(2)}`
  const errorId = `${checkId}-error`

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={checkId}
        className={[
          'flex items-start gap-3 cursor-pointer',
          'text-body text-text-main',
          props.disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <input
          id={checkId}
          type="checkbox"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={[
            'mt-0.5 h-5 w-5 rounded accent-primary flex-shrink-0',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          ].join(' ')}
          {...props}
        />
        <span>{label}</span>
      </label>
      {error && (
        <p id={errorId} role="alert" className="text-small text-error">
          {error}
        </p>
      )}
    </div>
  )
}

