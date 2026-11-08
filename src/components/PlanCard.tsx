/**
 * PlanCard — name, price, Benefits, Active/Inactive, Member count.
 * Tap → M2. T-C-15.
 */
import React from 'react'
import { formatMoney } from '../lib/format'

export interface PlanCardProps {
  name: string
  price: number
  benefits: string | null
  status: 'active' | 'inactive'
  memberCount: number
  onClick: () => void
}

export function PlanCard({ name, price, benefits, status, memberCount, onClick }: PlanCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full text-left bg-white rounded-card shadow-card p-4',
        'flex flex-col gap-2',
        'hover:shadow-md transition-shadow duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
      ].join(' ')}
      aria-label={`${name}, ${formatMoney(price)} per month, ${status}, ${memberCount} member${memberCount !== 1 ? 's' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-heading font-semibold text-text-main">{name}</span>
        <span
          className={[
            'text-small font-medium px-2 py-0.5 rounded-badge',
            status === 'active'
              ? 'bg-[#E3F4E6] text-[#1B5E20]'
              : 'bg-[#F3F4F6] text-text-secondary',
          ].join(' ')}
        >
          {status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </div>
      <p className="text-body text-text-secondary">{`${formatMoney(price)} per month`}</p>
      {benefits && (
        <p className="text-small text-text-secondary whitespace-pre-wrap">{benefits}</p>
      )}
      <p className="text-small text-text-secondary">
        {`${memberCount} ${memberCount === 1 ? 'member' : 'members'}`}
      </p>
    </button>
  )
}

