/**
 * SelectField — labelled select with error state.
 * T-C-3
 */
import React from 'react'

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  children: React.ReactNode
}

export function SelectField({
  label,
  error,
  id,
  className = '',
  children,
  ...props
}: SelectFieldProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  const errorId  = `${selectId}-error`

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={selectId} className="text-sm font-medium text-text-main">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={[
          'w-full rounded-input border px-3 py-3 text-body',
          'bg-white text-text-main',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          error ? 'border-error' : 'border-border',
          props.disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} role="alert" className="text-small text-error">
          {error}
        </p>
      )}
    </div>
  )
}

