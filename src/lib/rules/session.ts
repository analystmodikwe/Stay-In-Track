/**
 * Session age check (PRD Section 5, T-AUTH-2)
 * Exported for unit testing. Used by useSession hook.
 */
import type { Session } from '@supabase/supabase-js'

const SESSION_MAX_AGE_DAYS = 30
const MS_PER_DAY = 24 * 60 * 60 * 1000

export function isSessionTooOld(session: Session, nowMs: number = Date.now()): boolean {
  const createdAt = (session as unknown as { created_at?: number }).created_at
  if (typeof createdAt !== 'number') return false
  const ageMs = nowMs - createdAt * 1000
  return ageMs > SESSION_MAX_AGE_DAYS * MS_PER_DAY
}
