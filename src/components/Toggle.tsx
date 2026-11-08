/**
 * Toggle — a switch (on/off) for settings like payment reminders.
 * T-C-3
 */
import React from 'react'

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export function Toggle({ label, id, disabled, ...props }: ToggleProps) {
  const toggleId = id ?? `toggle-${Math.random().toString(36).slice(2)}`

  return (
    <label
      htmlFor={toggleId}
      className={[
        'flex items-center justify-between gap-3',
        'text-body text-text-main',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      <span>{label}</span>
      <div className="relative">
        <input
          id={toggleId}
          type="checkbox"
          role="switch"
          aria-checked={props.checked !== undefined ? !!props.checked : undefined}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div
          className={[
            'w-11 h-6 rounded-full',
            'bg-border peer-checked:bg-accent',
            'transition-colors duration-200',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-1',
          ].join(' ')}
        />
        <div
          className={[
            'absolute top-0.5 left-0.5',
            'w-5 h-5 rounded-full bg-white shadow',
            'transition-transform duration-200',
            'peer-checked:translate-x-5',
          ].join(' ')}
        />
      </div>
    </label>
  )
}

