/**
 * MemberRow — full name, Plan name, StatusBadge, paid-until date.
 * Tap → S7. T-C-13.
 */
import React from 'react'
import { StatusBadge, MemberStatus } from './StatusBadge'
import { formatDate } from '../lib/format'

export interface MemberRowProps {
  fullName: string
  planName: string
  status: MemberStatus
  paidUntil: string | null  // ISO date string or null
  onClick: () => void
}

export function MemberRow({ fullName, planName, status, paidUntil, onClick }: MemberRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full flex items-center gap-3 py-3 px-screen',
        'bg-white border-b border-border',
        'hover:bg-background transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
        'min-h-[44px] text-left',
      ].join(' ')}
      aria-label={`${fullName}, ${planName}, ${status}${paidUntil ? `, paid until ${formatDate(paidUntil)}` : ''}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium text-text-main truncate">{fullName}</p>
        <p className="text-small text-text-secondary">
          {planName} &middot; {paidUntil ? `Paid until ${formatDate(paidUntil)}` : 'No Payment yet'}
        </p>
      </div>
      <StatusBadge status={status} />
    </button>
  )
}

