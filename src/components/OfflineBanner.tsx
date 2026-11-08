/**
 * OfflineBanner — shown when the browser is offline.
 * Exact text from PRD 12.2 / T-C-5.
 */
import React from 'react'
import { WifiOff } from 'lucide-react'
import { useOnline } from '../hooks/useOnline'

export interface OfflineBannerProps {
  className?: string
  forceOffline?: boolean
}

export function OfflineBanner({ className = '', forceOffline }: OfflineBannerProps) {
  const online = useOnline()
  const isOffline = forceOffline !== undefined ? forceOffline : !online

  if (!isOffline) return null

  return (
    <div
      role="alert"
      className={[
        'w-full bg-warning/10 border-b border-warning/30',
        'px-screen py-2',
        'flex items-center gap-2',
        'text-small text-[#7A4B00]',
        className,
      ].join(' ')}
    >
      <WifiOff size={16} aria-hidden="true" />
      <span>You're offline. Changes will not be saved.</span>
    </div>
  )
}
