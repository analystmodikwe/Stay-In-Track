import { supabase } from '../supabase'
import { messages } from '../messages'

export interface Plan {
  id: string
  gym_id: string
  name: string
  price: number
  benefits: string | null
  status: 'active' | 'inactive'
  created_at: string
  memberCount: number
}

export interface CreatePlanInput {
  name: string
  price: number
  benefits?: string | null
  status?: 'active' | 'inactive'
}

export interface UpdatePlanInput {
  name?: string
  price?: number
  benefits?: string | null
  status?: 'active' | 'inactive'
}

interface PlanRow {
  id: string
  gym_id: string
  name: string
  price: number | string
  benefits: string | null
  status: 'active' | 'inactive'
  created_at: string
  members?: { count: number }[]
}

function mapPlanError(error: { code?: string; message?: string } | null): string {
  if (!error) return messages.serverError
  if (
    error.code === '23505' ||
    /unique|duplicate/i.test(error.message || '')
  ) {
    return messages.duplicatePlan
  }
  return messages.serverError
}

export async function getPlans(): Promise<{ data: Plan[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*, members(count)')
      .order('created_at', { ascending: true })

    if (error) {
      return { data: null, error: mapPlanError(error) }
    }

    const plans: Plan[] = ((data as unknown as PlanRow[]) || []).map((row) => ({
      id: row.id,
      gym_id: row.gym_id,
      name: row.name,
      price: Number(row.price),
      benefits: row.benefits,
      status: row.status,
      created_at: row.created_at,
      memberCount: row.members?.[0]?.count ?? 0,
    }))

    return { data: plans, error: null }
  } catch {
    return { data: null, error: messages.serverError }
  }
}

export async function createPlan(
  input: CreatePlanInput
): Promise<{ data: Plan | null; error: string | null }> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('gym_id')
      .single()

    if (profileError || !profile?.gym_id) {
      return { data: null, error: messages.serverError }
    }

    const { data, error } = await supabase
      .from('plans')
      .insert({
        gym_id: profile.gym_id,
        name: input.name.trim(),
        price: input.price,
        benefits: input.benefits ? input.benefits.trim() : null,
        status: input.status || 'active',
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: mapPlanError(error) }
    }

    return {
      data: {
        ...data,
        price: Number(data.price),
        memberCount: 0,
      },
      error: null,
    }
  } catch {
    return { data: null, error: messages.serverError }
  }
}

export async function updatePlan(
  id: string,
  input: UpdatePlanInput
): Promise<{ data: Plan | null; error: string | null }> {
  try {
    const updatePayload: Record<string, unknown> = {}
    if (input.name !== undefined) updatePayload.name = input.name.trim()
    if (input.price !== undefined) updatePayload.price = input.price
    if (input.benefits !== undefined) {
      updatePayload.benefits = input.benefits ? input.benefits.trim() : null
    }
    if (input.status !== undefined) updatePayload.status = input.status

    const { data, error } = await supabase
      .from('plans')
      .update(updatePayload)
      .eq('id', id)
      .select('*, members(count)')
      .single()

    if (error) {
      return { data: null, error: mapPlanError(error) }
    }

    return {
      data: {
        ...data,
        price: Number(data.price),
        memberCount: data.members?.[0]?.count ?? 0,
      },
      error: null,
    }
  } catch {
    return { data: null, error: messages.serverError }
  }
}

