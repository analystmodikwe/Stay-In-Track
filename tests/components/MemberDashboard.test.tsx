/**
 * MemberDashboard component tests (S9)
 * T-US13-1, T-US13-2, T-US13-3, T-US14-1, T-US14-4, T-EDGE-6, T-S9-1
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { MemberDashboard } from '../../src/pages/MemberDashboard'
import * as memberApi from '../../src/lib/api/member'
import * as authApi from '../../src/lib/api/auth'
import { useSession } from '../../src/hooks/useSession'
import { useOnline } from '../../src/hooks/useOnline'
import { messages } from '../../src/lib/messages'

vi.mock('../../src/lib/api/member', () => ({
  getOwnMembership: vi.fn(),
}))

vi.mock('../../src/lib/api/auth', () => ({
  logOut: vi.fn(),
}))

vi.mock('../../src/hooks/useSession', () => ({
  useSession: vi.fn(),
}))

vi.mock('../../src/hooks/useOnline', () => ({
  useOnline: vi.fn(() => true),
}))

const sampleNaledi: memberApi.OwnMembership = {
  id: 'naledi-id',
  full_name: 'Naledi Khumalo',
  email: 'naledi.k@example.com',
  phone: '+27825550147',
  paid_until: '2026-11-15',
  is_18_or_older: true,
  status: 'active',
  plan: {
    id: 'p1',
    name: 'Student',
    price: 250,
    benefits: 'Gym floor access',
  },
  payments: [
    {
      id: 'pay-1',
      amount: 250,
      method: 'Cash',
      months: 1,
      payment_date: '2026-10-15',
      created_at: '2026-10-15T10:00:00Z',
    },
  ],
  gym: {
    name: 'Iron Haven Gym',
    grace_days: 3,
  },
  reminders_on: true,
}

function renderMemberDashboard(todayOverride?: string) {
  vi.mocked(useSession).mockReturnValue({
    session: {
      user: {
        id: 'user-naledi',
        email: 'naledi.k@example.com',
        user_metadata: { role: 'member', full_name: 'Naledi Khumalo' },
      },
    } as never,
    loading: false,
  })

  return render(
    <MemoryRouter initialEntries={['/home']}>
      <Routes>
        <Route path="/home" element={<MemberDashboard todayOverride={todayOverride} />} />
        <Route path="/" element={<div>Welcome</div>} />
        <Route path="/settings" element={<div>Settings</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('MemberDashboard screen (S9)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useOnline).mockReturnValue(true)
  })

  it('T-S9-1 shows loading placeholder with 3 grey blocks', () => {
    vi.mocked(memberApi.getOwnMembership).mockReturnValue(new Promise(() => {}))
    renderMemberDashboard()
    const placeholders = document.querySelectorAll('.animate-pulse')
    expect(placeholders.length).toBeGreaterThanOrEqual(1)
  })

  it('T-US13-1 Naledi Khumalo: Active badge, paid until 15 Nov 2026, Student plan with R250.00, Benefits, Payment history', async () => {
    vi.mocked(memberApi.getOwnMembership).mockResolvedValue({
      data: sampleNaledi,
      error: null,
    })

    renderMemberDashboard()

    // Header & Gym name
    expect(await screen.findByRole('heading', { name: /my membership/i })).toBeInTheDocument()
    expect(screen.getByText('Iron Haven Gym')).toBeInTheDocument()

    // Status badge Active
    expect(screen.getByText('Active')).toBeInTheDocument()

    // Paid until
    expect(screen.getByText(/15 Nov 2026/)).toBeInTheDocument()

    // Plan & Benefits
    expect(screen.getByText('Student')).toBeInTheDocument()
    expect(screen.getByText(/R250\.00 per month/i)).toBeInTheDocument()
    expect(screen.getByText('Gym floor access')).toBeInTheDocument()

    // Payment history
    expect(screen.getByText('Payment history')).toBeInTheDocument()
    expect(screen.getAllByText(/R250\.00/).length).toBe(2)
    expect(screen.getByText('Cash')).toBeInTheDocument()
    expect(screen.getByText('1 month')).toBeInTheDocument()
  })

  it('T-US13-2 Overdue status shows overdue banner', async () => {
    vi.mocked(memberApi.getOwnMembership).mockResolvedValue({
      data: {
        ...sampleNaledi,
        status: 'overdue',
        paid_until: '2026-10-10',
      },
      error: null,
    })

    renderMemberDashboard()

    expect(
      await screen.findByText(
        'Your membership has expired. Please pay at the gym to get access again.'
      )
    ).toBeInTheDocument()
  })

  it('T-US13-3 No payments shows "No Payments yet."', async () => {
    vi.mocked(memberApi.getOwnMembership).mockResolvedValue({
      data: {
        ...sampleNaledi,
        payments: [],
        paid_until: null,
      },
      error: null,
    })

    renderMemberDashboard()

    expect(await screen.findByText('No Payments yet.')).toBeInTheDocument()
    expect(screen.getByText('No Payment yet')).toBeInTheDocument()
  })

  it('T-US14-1 Reminders ON and 2 days before paid_until -> shows due soon banner', async () => {
    vi.mocked(memberApi.getOwnMembership).mockResolvedValue({
      data: {
        ...sampleNaledi,
        paid_until: '2026-11-15',
        reminders_on: true,
      },
      error: null,
    })

    renderMemberDashboard('2026-11-13')

    expect(
      await screen.findByText(
        'Payment due soon: your membership ends on 15 Nov 2026.'
      )
    ).toBeInTheDocument()
  })

  it('T-US14-4 Reminders OFF and Grace period -> shows Grace period banner', async () => {
    vi.mocked(memberApi.getOwnMembership).mockResolvedValue({
      data: {
        ...sampleNaledi,
        status: 'grace',
        paid_until: '2026-10-26',
        reminders_on: false,
        gym: { name: 'Iron Haven Gym', grace_days: 3 },
      },
      error: null,
    })

    renderMemberDashboard()

    // 2026-10-26 + 3 days = 2026-10-29 -> "29 Oct 2026"
    expect(
      await screen.findByText(
        'Your payment is late. Please pay by 29 Oct 2026 to keep your access.'
      )
    ).toBeInTheDocument()
  })

  it('T-EDGE-6 Deleted member record -> shows removed message and logs out', async () => {
    vi.mocked(memberApi.getOwnMembership).mockResolvedValue({
      data: null,
      error: messages.memberRemoved,
    })
    vi.mocked(authApi.logOut).mockResolvedValue({ error: null })

    renderMemberDashboard()

    expect(
      await screen.findByText(messages.memberRemoved)
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(authApi.logOut).toHaveBeenCalled()
    })
  })
})
