/**
 * useRecoveryMode — returns true when Supabase has fired a PASSWORD_RECOVERY
 * auth event for the current browser session.
 *
 * We track this at module level (outside React) so the flag is set before
 * the ForgotPassword component mounts, even if Supabase processes the token
 * and fires PASSWORD_RECOVERY synchronously during page load.
 */
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Module-level flag: set once per page load when PASSWORD_RECOVERY fires.
let _recoveryFired = false
const _listeners = new Set<() => void>()

// Subscribe at module load time (before any component mounts).
supabase.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') {
    _recoveryFired = true
    for (const fn of _listeners) fn()
  }
})

export function useRecoveryMode(): boolean {
  const [recovery, setRecovery] = useState(_recoveryFired)

  useEffect(() => {
    if (_recoveryFired) {
      setRecovery(true)
      return
    }
    function onRecovery() {
      setRecovery(true)
    }
    _listeners.add(onRecovery)
    return () => { _listeners.delete(onRecovery) }
  }, [])

  return recovery
}

/** Call this after the password has been successfully updated to reset state. */
export function clearRecoveryMode() {
  _recoveryFired = false
}

