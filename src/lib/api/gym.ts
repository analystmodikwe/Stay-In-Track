import { supabase } from '../supabase'
import { messages } from '../messages'

export interface Gym {
  id: string
  name: string
  grace_days: number
}

export async function getGym(): Promise<{ data: Gym | null; error: string | null }> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('gym_id')
      .single()

    if (profileError || !profile?.gym_id) {
      return { data: null, error: messages.serverError }
    }

    const { data: gym, error } = await supabase
      .from('gyms')
      .select('id, name, grace_days')
      .eq('id', profile.gym_id)
      .single()

    if (error) {
      return { data: null, error: messages.serverError }
    }

    return { data: gym, error: null }
  } catch {
    return { data: null, error: messages.serverError }
  }
}

export async function updateGracePeriod(
  days: number
): Promise<{ error: string | null }> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('gym_id')
      .single()

    if (profileError || !profile?.gym_id) {
      return { error: messages.serverError }
    }

    const { error } = await supabase
      .from('gyms')
      .update({ grace_days: days })
      .eq('id', profile.gym_id)

    if (error) {
      return { error: messages.serverError }
    }

    return { error: null }
  } catch {
    return { error: messages.serverError }
  }
}

