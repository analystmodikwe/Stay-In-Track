/**
 * Dashboard API operations:
 * - OP20 Get Admin Dashboard
 */
import { supabase } from '../supabase'
import { messages } from '../messages'

export interface PlanMemberCount {
  name: string
  count: number
}

export interface OverdueMemberSummary {
  id: string
  full_name: string
  plan_name: string
  paid_until: string | null
  status: string
}

export interface DashboardData {
  total: number
  active: number
  grace: number
  overdue: number
  revenue: number
  plans: PlanMemberCount[]
  overdue_list: OverdueMemberSummary[]
}

export async function getAdminDashboard(today?: string): Promise<{
  data: DashboardData | null
  error: string | null
}> {
  try {
    const params: { p_today?: string } = {}
    if (today) {
      params.p_today = today
    }

    const { data, error } = await supabase.rpc('get_dashboard', params)

    if (error) {
      return { data: null, error: messages.serverError }
    }

    return {
      data: {
        total: Number(data.total || 0),
        active: Number(data.active || 0),
        grace: Number(data.grace || 0),
        overdue: Number(data.overdue || 0),
        revenue: Number(data.revenue || 0),
        plans: data.plans || [],
        overdue_list: data.overdue_list || [],
      },
      error: null,
    }
  } catch {
    return { data: null, error: messages.serverError }
  }
}

