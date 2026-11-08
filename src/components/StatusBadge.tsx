/**
 * StatusBadge — Active (green), Grace period (amber), Overdue (red).
 * Always shows icon AND text — never colour alone. T-C-11.
 */
import React from 'react'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

export type MemberStatus = 'active' | 'grace' | 'overdue'

export interface StatusBadgeProps {
  status: MemberStatus
}

const badgeConfig = {
  active: {
    label: 'Active',
    icon: CheckCircle,
    bg:   '#E3F4E6',
    text: '#1B5E20',
  },
  grace: {
    label: 'Grace period',
    icon: Clock,
    bg:   '#FFF3CD',
    text: '#7A4B00',
  },
  overdue: {
    label: 'Overdue',
    icon: AlertCircle,
    bg:   '#FBE3E3',
    text: '#9B1C1C',
  },
} as const

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg  = badgeConfig[status]
  const Icon = cfg.icon

  return (
    <span
      aria-label={cfg.label}
      className="inline-flex items-center gap-1.5 rounded-badge px-2.5 py-1 text-small font-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      <Icon size={14} aria-hidden="true" />
      {cfg.label}
    </span>
  )
}

