import { supabase } from '../supabase'
import { messages } from '../messages'
import { normalizePhone } from '../format'
import { calculateMemberStatus } from '../status'
import { Plan } from './plans'

export interface Member {
  id: string
  gym_id: string
  user_id: string | null
  full_name: string
  email: string
  phone: string | null
  plan_id: string
  paid_until: string | null
  is_18_or_older: boolean
  created_at: string
  plan_name?: string
  status?: 'active' | 'grace' | 'overdue'
}

export interface MemberWithDetails extends Member {
  plan: Plan
  payments: Array<{
    id: string
    amount: number
    method: 'Cash' | 'EFT' | 'Card'
    months: number
    payment_date: string
    created_at: string
  }>
}

interface PaymentRow {
  id: string
  amount: number | string
  method: 'Cash' | 'EFT' | 'Card'
  months: number
  payment_date: string
  created_at: string
}

export interface AddMemberInput {
  full_name: string
  email: string
  phone?: string | null
  plan_id: string
  is_18_or_older: boolean
}

export interface UpdateMemberInput {
  full_name?: string
  email?: string
  phone?: string | null
  plan_id?: string
}

function mapMemberError(error: { code?: string; message?: string } | null): string {
  if (!error) return messages.serverError
  const msg = error.message || ''

  if (msg.includes('member_limit')) {
    return messages.memberLimit
  }
  if (msg.includes('email_locked')) {
    return messages.emailLocked
  }
  if (
    error.code === '23505' ||
    /unique|duplicate/i.test(msg)
  ) {
    return messages.duplicateMember
  }
  return messages.serverError
}

export async function listMembers(options?: {
  search?: string
  status?: string
  cursor?: string
}): Promise<{ data: Member[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('list_members', {
      p_search: options?.search || null,
      p_status: options?.status && options.status !== 'All' ? options.status.toLowerCase() : null,
      p_cursor: options?.cursor || null,
    })

    if (error) {
      return { data: null, error: mapMemberError(error) }
    }

    return { data: data as Member[], error: null }
  } catch {
    return { data: null, error: messages.serverError }
  }
}

export async function getMemberWithPayments(
  id: string
): Promise<{ data: MemberWithDetails | null; error: string | null }> {
  try {
    const { data: member, error } = await supabase
      .from('members')
      .select('*, plans(*), payments(*)')
      .eq('id', id)
      .single()

    if (error || !member) {
      return { data: null, error: mapMemberError(error) }
    }

    const { data: gym } = await supabase
      .from('gyms')
      .select('grace_days')
      .eq('id', member.gym_id)
      .single()

    const graceDays = gym?.grace_days ?? 3
    const status = calculateMemberStatus(member.paid_until, graceDays)

    const rawPayments: PaymentRow[] = Array.isArray(member.payments) ? member.payments : []
    const payments = rawPayments
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        method: p.method,
        months: p.months,
        payment_date: p.payment_date,
        created_at: p.created_at,
      }))

    const result: MemberWithDetails = {
      id: member.id,
      gym_id: member.gym_id,
      user_id: member.user_id,
      full_name: member.full_name,
      email: member.email,
      phone: member.phone,
      plan_id: member.plan_id,
      paid_until: member.paid_until,
      is_18_or_older: member.is_18_or_older,
      created_at: member.created_at,
      status,
      plan: {
        id: member.plans.id,
        gym_id: member.plans.gym_id,
        name: member.plans.name,
        price: Number(member.plans.price),
        benefits: member.plans.benefits,
        status: member.plans.status,
        created_at: member.plans.created_at,
        memberCount: 0,
      },
      payments,
    }

    return { data: result, error: null }
  } catch {
    return { data: null, error: messages.serverError }
  }
}

export async function addMember(
  input: AddMemberInput
): Promise<{ data: Member | null; error: string | null }> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('gym_id')
      .single()

    if (profileError || !profile?.gym_id) {
      return { data: null, error: messages.serverError }
    }

    const { data, error } = await supabase
      .from('members')
      .insert({
        gym_id: profile.gym_id,
        full_name: input.full_name.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone ? normalizePhone(input.phone) : null,
        plan_id: input.plan_id,
        is_18_or_older: input.is_18_or_older,
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: mapMemberError(error) }
    }

    return { data, error: null }
  } catch {
    return { data: null, error: messages.serverError }
  }
}

export async function updateMember(
  id: string,
  input: UpdateMemberInput
): Promise<{ data: Member | null; error: string | null }> {
  try {
    const updatePayload: Record<string, unknown> = {}
    if (input.full_name !== undefined) updatePayload.full_name = input.full_name.trim()
    if (input.email !== undefined) updatePayload.email = input.email.trim().toLowerCase()
    if (input.phone !== undefined) {
      updatePayload.phone = input.phone ? normalizePhone(input.phone) : null
    }
    if (input.plan_id !== undefined) updatePayload.plan_id = input.plan_id

    const { data, error } = await supabase
      .from('members')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error: mapMemberError(error) }
    }

    return { data, error: null }
  } catch {
    return { data: null, error: messages.serverError }
  }
}

export async function deleteMember(
  id: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: mapMemberError(error) }
    }

    return { error: null }
  } catch {
    return { error: messages.serverError }
  }
}

