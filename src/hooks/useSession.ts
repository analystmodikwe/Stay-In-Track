/**
 * useSession — returns the current Supabase auth session (or null) and a
 * loading flag.  Checks the session age on startup and signs the user out
 * if it is older than 30 days (PRD Section 5, T-AUTH-2).
 */
import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

const SESSION_MAX_AGE_DAYS = 30
const MS_PER_DAY = 24 * 60 * 60 * 1000

function isSessionTooOld(session: Session): boolean {
  // session.created_at is a Unix timestamp in seconds
  const createdAt = (session as unknown as { created_at?: number }).created_at
  if (typeof createdAt !== 'number') return false
  const ageMs = Date.now() - createdAt * 1000
  return ageMs > SESSION_MAX_AGE_DAYS * MS_PER_DAY
}

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

