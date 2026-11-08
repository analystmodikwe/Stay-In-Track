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
})

