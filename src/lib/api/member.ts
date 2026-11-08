/**
 * Member API operations (OP21, OP22)
 * OP21: getOwnMembership() -> Own membership, plan, payments, gym, notices data
 * OP22: setReminders(on) -> Update profile reminders_on
 */
import { supabase } from '../supabase'
import { messages } from '../messages'
import { calculateMemberStatus } from '../status'

export interface OwnMembership {
  id: string
  full_name: string
  email: string
  phone: string | null
  paid_until: string | null
  is_18_or_older: boolean
  status: 'active' | 'grace' | 'overdue'
  plan: {
    id: string
    name: string
    price: number
    benefits: string | null
  }
  payments: Array<{
    id: string
    amount: number
    method: 'Cash' | 'EFT' | 'Card'
    months: number
    payment_date: string
    created_at: string
  }>
  gym: {
    name: string
    grace_days: number
  }
  reminders_on: boolean
}

export async function getOwnMembership(): Promise<{
  data: OwnMembership | null
  error: string | null
}> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    return { data: null, error: messages.sessionExpired }
  }

  const userId = userData.user.id

  // 1. Get profile reminders_on
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('reminders_on, gym_id')
    .eq('id', userId)
    .maybeSingle()

  if (profileErr || !profile) {
    return { data: null, error: messages.serverError }
  }

  // 2. Query member with plan, payments, gym
  const { data: member, error: memberErr } = await supabase
    .from('members')
    .select(`
      id,
      full_name,
      email,
      phone,
      paid_until,
      is_18_or_older,
      plans ( id, name, price, benefits ),
      payments ( id, amount, method, months, payment_date, created_at ),
      gyms ( name, grace_days )
    `)
    .eq('user_id', userId)
    .maybeSingle()

  if (memberErr) {
    return { data: null, error: messages.serverError }
  }

  if (!member) {
    return { data: null, error: messages.memberRemoved }
  }

  const plan = member.plans as unknown as { id: string; name: string; price: number; benefits: string | null }
  const paymentsRaw = (member.payments || []) as unknown as Array<{
    id: string
    amount: number | string
    method: 'Cash' | 'EFT' | 'Card'
    months: number
    payment_date: string
    created_at: string
  }>
  const gym = member.gyms as unknown as { name: string; grace_days: number }

  // Sort payments newest first (by created_at desc)
  const payments = paymentsRaw
    .map((p) => ({
      ...p,
      amount: Number(p.amount),
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const status = calculateMemberStatus(member.paid_until, gym.grace_days)

  return {
    data: {
      id: member.id,
      full_name: member.full_name,
      email: member.email,
      phone: member.phone,
      paid_until: member.paid_until,
      is_18_or_older: member.is_18_or_older,
      status,
      plan: {
        id: plan.id,
        name: plan.name,
        price: Number(plan.price),
        benefits: plan.benefits,
      },
      payments,
      gym,
      reminders_on: profile.reminders_on ?? true,
    },
    error: null,
  }
}

export async function setReminders(on: boolean): Promise<{ error: string | null }> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    return { error: messages.sessionExpired }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ reminders_on: on })
    .eq('id', userData.user.id)

  if (error) {
    return { error: messages.serverError }
  }

  return { error: null }
}

