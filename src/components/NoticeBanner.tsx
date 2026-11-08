/**
 * NoticeBanner — icon + text on a tinted background; not tappable.
 * T-C-9. Used on S3 (verify banner) and S9 (member notices).
 */
import React from 'react'
import type { LucideIcon } from 'lucide-react'

export type BannerVariant = 'info' | 'warning' | 'error'

export interface NoticeBannerProps {
  icon: LucideIcon
  text: string
  variant?: BannerVariant
  className?: string
}

const variantStyles: Record<BannerVariant, string> = {
  info:    'bg-accent/10 text-[#0F766E] border border-accent/30',
  warning: 'bg-[#FFF3CD] text-[#7A4B00] border border-[#7A4B00]/20',
  error:   'bg-[#FBE3E3] text-[#9B1C1C] border border-[#9B1C1C]/20',
}

export function NoticeBanner({ icon: Icon, text, variant = 'info', className = '' }: NoticeBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'flex items-start gap-3 rounded-card px-4 py-3',
        variantStyles[variant],
        className,
      ].join(' ')}
    >
      <Icon size={20} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span className="text-small">{text}</span>
    </div>
  )
}

