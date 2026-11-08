/**
 * OfflineBanner — shown when the browser is offline.
 * Exact text from PRD 12.2 / T-C-5.
 */
import React from 'react'
import { WifiOff } from 'lucide-react'
import { useOnline } from '../hooks/useOnline'

export function OfflineBanner() {
  const online = useOnline()

  if (online) return null

  return (
    <div
      role="alert"
      className={[
        'w-full bg-warning/10 border-b border-warning/30',
        'px-screen py-2',
        'flex items-center gap-2',
        'text-small text-[#7A4B00]',
      ].join(' ')}
    >
      <WifiOff size={16} aria-hidden="true" />
      <span>You're offline. Changes will not be saved.</span>
    </div>
  )
}

