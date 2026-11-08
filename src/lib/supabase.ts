/**
 * Supabase client — uses the public VITE_ variables only.
 * The service role key is NEVER imported here (Section 6, Rule 10).
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Copy .env.example to .env and fill in the values.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

