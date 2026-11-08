/**
 * useOnline — returns true when the browser is online, false when offline.
 * Used by OfflineBanner and to disable save buttons (PRD 8.2, T-C-5).
 */
import { useEffect, useState } from 'react'

export function useOnline(): boolean {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline  = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return online
}

