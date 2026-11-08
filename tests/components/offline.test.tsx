import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AdminDashboard } from '../../src/pages/AdminDashboard'
import { Members } from '../../src/pages/Members'
import { Plans } from '../../src/pages/Plans'
import { MemberDashboard } from '../../src/pages/MemberDashboard'
import { MemberFormModal } from '../../src/modals/MemberForm'
import { PlanFormModal } from '../../src/modals/PlanForm'
import { RecordPaymentModal } from '../../src/modals/RecordPayment'
import * as useOnlineHook from '../../src/hooks/useOnline'
import * as dashboardApi from '../../src/lib/api/dashboard'
import * as memberApi from '../../src/lib/api/member'
import * as membersApi from '../../src/lib/api/members'
import * as plansApi from '../../src/lib/api/plans'

describe('Offline Behavior (T-NFR-1)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(useOnlineHook, 'useOnline').mockReturnValue(false)
  })

  it('shows the offline banner on Admin Dashboard (S5) and keeps data', async () => {
    vi.spyOn(dashboardApi, 'getAdminDashboard').mockResolvedValue({
      data: {
        total: 10,
        active: 8,
        grace: 1,
        overdue: 1,
        revenue: 3500,
        plans: [{ name: 'Standard', count: 10 }],
        overdue_list: [],
      },
      error: null,
    })

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    )

    expect(await screen.findByText(/you're offline/i)).toBeInTheDocument()
    expect(screen.getByText('Total Members')).toBeInTheDocument()
    expect(screen.getAllByText('10').length).toBeGreaterThan(0)
  })

  it('shows the offline banner on Member Dashboard (S9) and keeps data', async () => {
    vi.spyOn(memberApi, 'getOwnMembership').mockResolvedValue({
      data: {
        id: 'm-1',
        full_name: 'Naledi Khumalo',
        email: 'naledi@example.com',
        phone: '+27825550147',
        paid_until: '2026-11-15',
        is_18_or_older: true,
        status: 'active',
        plan: {
          id: 'p-1',
          name: 'Student',
          price: 250,
          benefits: 'Gym floor access',
        },
        gym: { name: 'Iron Haven Gym', grace_days: 3 },
        payments: [],
        reminders_on: true,
      },
      error: null,
    })

    render(
      <MemoryRouter>
        <MemberDashboard />
      </MemoryRouter>
    )

    expect(await screen.findByText(/you're offline/i)).toBeInTheDocument()
    expect(screen.getByText('Iron Haven Gym')).toBeInTheDocument()
  })

  it('shows the offline banner on Members list (S6)', async () => {
    vi.spyOn(membersApi, 'listMembers').mockResolvedValue({
      data: [],
      error: null,
    })
    vi.spyOn(plansApi, 'getPlans').mockResolvedValue({
      data: [],
      error: null,
    })

    render(
      <MemoryRouter>
        <Members />
      </MemoryRouter>
    )

    expect(await screen.findByText(/you're offline/i)).toBeInTheDocument()
  })

  it('shows the offline banner on Plans list (S8)', async () => {
    vi.spyOn(plansApi, 'getPlans').mockResolvedValue({
      data: [],
      error: null,
    })

    render(
      <MemoryRouter>
        <Plans />
      </MemoryRouter>
    )

    expect(await screen.findByText(/you're offline/i)).toBeInTheDocument()
  })

  it('disables save button in MemberFormModal when offline', () => {
    render(
      <MemberFormModal
        isOpen={true}
        plans={[{ id: 'p1', gym_id: 'g1', name: 'Standard', price: 350, benefits: '', status: 'active', memberCount: 0, created_at: '' }]}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    )

    const saveBtn = screen.getByRole('button', { name: /^save$/i })
    expect(saveBtn).toBeDisabled()
  })

  it('disables save button in PlanFormModal when offline', () => {
    render(
      <PlanFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    )

    const saveBtn = screen.getByRole('button', { name: /^save$/i })
    expect(saveBtn).toBeDisabled()
  })

  it('disables record payment button in RecordPaymentModal when offline', () => {
    render(
      <RecordPaymentModal
        isOpen={true}
        member={{
          id: 'm1',
          full_name: 'Naledi Khumalo',
          plan_id: 'p1',
          plan_price: 250,
          status: 'active',
          paid_until: '2026-11-15',
        }}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    )

    const recordBtn = screen.getByRole('button', { name: /^save payment$/i })
    expect(recordBtn).toBeDisabled()
  })
})
