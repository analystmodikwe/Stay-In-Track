/**
 * useSession — returns the current Supabase auth session (or null) and a
 * loading flag.  Checks the session age on startup and signs the user out
 * if it is older than 30 days (PRD Section 5, T-AUTH-2).
 */
import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { isSessionTooOld } from '../lib/rules/session'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const s = data.session
      if (s && isSessionTooOld(s)) {
        await supabase.auth.signOut()
        setSession(null)
      } else {
        setSession(s)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}

