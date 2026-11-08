/**
 * StatCard — label + large number; not tappable. T-C-14.
 */
import React from 'react'

export interface StatCardProps {
  label: string
  value: string | number
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div
      className={[
        'bg-white rounded-card shadow-card',
        'flex flex-col gap-1 p-4',
      ].join(' ')}
      aria-label={`${label}: ${value}`}
    >
      <span className="text-small text-text-secondary">{label}</span>
      <span
        className="text-[28px] font-bold text-text-main leading-tight"
        aria-hidden="true"
      >
        {value}
      </span>
    </div>
  )
}

