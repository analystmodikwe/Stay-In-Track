import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { MemberDetails } from '../../src/pages/MemberDetails'
import * as membersApi from '../../src/lib/api/members'
import * as plansApi from '../../src/lib/api/plans'
import { messages } from '../../src/lib/messages'

vi.mock('../../src/lib/api/members')
vi.mock('../../src/lib/api/plans')

const mockMember = {
  id: 'member-1',
  gym_id: 'gym-1',
  user_id: null,
  full_name: 'Thando Mokoena',
  email: 'thando.m@example.com',
  phone: '+27825550147',
  plan_id: 'plan-1',
  paid_until: '2026-10-26',
  is_18_or_older: true,
  created_at: '2026-10-28T00:00:00Z',
  plan: {
    id: 'plan-1',
    gym_id: 'gym-1',
    name: 'Standard',
    price: 350,
    benefits: 'Gym floor access, 1 fitness assessment',
    status: 'active' as const,
    created_at: '2026-10-28T00:00:00Z',
    memberCount: 1,
  },
  payments: [],
  status: 'grace' as const,
}

function renderMemberDetails(id = 'member-1') {
  return render(
    <MemoryRouter initialEntries={[`/members/${id}`]}>
      <Routes>
        <Route path="/members/:id" element={<MemberDetails />} />
        <Route path="/members" element={<div>Members Screen</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('MemberDetails screen (S7)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(plansApi.getPlans).mockResolvedValue({
      data: [mockMember.plan],
      error: null,
    })
  })

  it('T-S7-1 renders member details, status badge, plan info, and delete button', async () => {
    vi.mocked(membersApi.getMemberWithPayments).mockResolvedValue({
      data: mockMember,
      error: null,
    })

    renderMemberDetails()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Thando Mokoena' })).toBeInTheDocument()
      expect(screen.getByText('Grace period')).toBeInTheDocument()
      expect(screen.getByText(/Paid until 26 Oct 2026/)).toBeInTheDocument()
      expect(screen.getByText('Standard')).toBeInTheDocument()
      expect(screen.getByText(/R350.00 per month/)).toBeInTheDocument()
      expect(screen.getByText('Gym floor access, 1 fitness assessment')).toBeInTheDocument()
      expect(screen.getByText('thando.m@example.com')).toBeInTheDocument()
      expect(screen.getByText('+27 82 555 0147')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete member' })).toBeInTheDocument()
    })
  })

  it('T-US6-1 edit member updates phone and displays toast', async () => {
    vi.mocked(membersApi.getMemberWithPayments).mockResolvedValue({
      data: mockMember,
      error: null,
    })
    vi.mocked(membersApi.updateMember).mockResolvedValue({
      data: { ...mockMember, phone: '+27829999999' },
      error: null,
    })

    renderMemberDetails()

    await screen.findByRole('heading', { name: 'Thando Mokoena' })

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('heading', { name: 'Edit member' })).toBeInTheDocument()

    const phoneInput = screen.getByLabelText('Phone (optional)')
    fireEvent.change(phoneInput, { target: { value: '+27 82 999 9999' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(membersApi.updateMember).toHaveBeenCalledWith('member-1', expect.objectContaining({
        phone: '+27829999999',
      }))
      expect(screen.getByText(messages.memberUpdated)).toBeInTheDocument()
    })
  })

  it('T-US6-2 delete member opens M5 confirmation modal and navigates to S6 on delete', async () => {
    vi.mocked(membersApi.getMemberWithPayments).mockResolvedValue({
      data: mockMember,
      error: null,
    })
    vi.mocked(membersApi.deleteMember).mockResolvedValue({ error: null })

    renderMemberDetails()

    await screen.findByRole('heading', { name: 'Thando Mokoena' })

    fireEvent.click(screen.getByRole('button', { name: 'Delete member' }))

    // M5 modal confirmation
    expect(screen.getByRole('heading', { name: 'Delete this Member?' })).toBeInTheDocument()
    expect(screen.getByText(/This permanently deletes the Member and all their Payments/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(membersApi.deleteMember).toHaveBeenCalledWith('member-1')
      expect(screen.getByText('Members Screen')).toBeInTheDocument()
    })
  })

  it('T-S7-2 displays "No Payments yet." when member has no payments', async () => {
    vi.mocked(membersApi.getMemberWithPayments).mockResolvedValue({
      data: { ...mockMember, payments: [] },
      error: null,
    })

    renderMemberDetails()

    await screen.findByRole('heading', { name: 'Thando Mokoena' })
    expect(screen.getByText('No Payments yet.')).toBeInTheDocument()
  })

  it('T-S7-2 renders payment history rows newest first', async () => {
    const twoPayments = [
      {
        id: 'pay-2',
        gym_id: 'gym-1',
        member_id: 'member-1',
        amount: 350,
        method: 'Cash' as const,
        months: 1,
        payment_date: '2026-10-26',
        previous_paid_until: '2026-09-26',
        recorded_by: 'admin-1',
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1h ago
      },
      {
        id: 'pay-1',
        gym_id: 'gym-1',
        member_id: 'member-1',
        amount: 350,
        method: 'Cash' as const,
        months: 1,
        payment_date: '2026-09-26',
        previous_paid_until: null,
        recorded_by: 'admin-1',
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
      },
    ]

    vi.mocked(membersApi.getMemberWithPayments).mockResolvedValue({
      data: { ...mockMember, payments: twoPayments },
      error: null,
    })

    renderMemberDetails()

    await screen.findByRole('heading', { name: 'Thando Mokoena' })

    // Check payment history items
    expect(screen.getAllByText(/26 Oct 2026/).length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/26 Sept? 2026/i)).toBeInTheDocument()

    // Latest payment (< 24h) has Undo button
    // T-EDGE-7: older payment does NOT have Undo button
    const undoButtons = screen.getAllByRole('button', { name: /undo/i })
    expect(undoButtons).toHaveLength(1)
  })

  it('T-US9-2 does not show Undo button if latest payment is older than 24 hours', async () => {
    const oldPayment = [
      {
        id: 'pay-old',
        gym_id: 'gym-1',
        member_id: 'member-1',
        amount: 350,
        method: 'Cash' as const,
        months: 1,
        payment_date: '2026-09-26',
        previous_paid_until: null,
        recorded_by: 'admin-1',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 48h ago
      },
    ]

    vi.mocked(membersApi.getMemberWithPayments).mockResolvedValue({
      data: { ...mockMember, payments: oldPayment },
      error: null,
    })

    renderMemberDetails()

    await screen.findByRole('heading', { name: 'Thando Mokoena' })
    expect(screen.queryByRole('button', { name: /undo/i })).not.toBeInTheDocument()
  })

  it('clicking Record payment opens M3 modal', async () => {
    vi.mocked(membersApi.getMemberWithPayments).mockResolvedValue({
      data: mockMember,
      error: null,
    })

    renderMemberDetails()

    await screen.findByRole('heading', { name: 'Thando Mokoena' })
    fireEvent.click(screen.getByRole('button', { name: 'Record payment' }))

    expect(screen.getByRole('heading', { name: 'Record payment' })).toBeInTheDocument()
  })
})

