import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Members } from '../../src/pages/Members'
import * as membersApi from '../../src/lib/api/members'
import * as plansApi from '../../src/lib/api/plans'
import { messages } from '../../src/lib/messages'

vi.mock('../../src/lib/api/members')
vi.mock('../../src/lib/api/plans')

const mockMembersList = [
  {
    id: 'member-1',
    gym_id: 'gym-1',
    user_id: 'user-1',
    full_name: 'Naledi Khumalo',
    email: 'naledi.k@example.com',
    phone: null,
    plan_id: 'plan-1',
    paid_until: '2026-11-15',
    is_18_or_older: true,
    created_at: '2026-10-28T00:00:00Z',
    plan_name: 'Student',
    status: 'active' as const,
  },
  {
    id: 'member-2',
    gym_id: 'gym-1',
    user_id: null,
    full_name: 'Thando Mokoena',
    email: 'thando.m@example.com',
    phone: '+27825550147',
    plan_id: 'plan-2',
    paid_until: '2026-10-26',
    is_18_or_older: true,
    created_at: '2026-10-28T00:00:00Z',
    plan_name: 'Standard',
    status: 'grace' as const,
  },
]

function renderMembers() {
  return render(
    <MemoryRouter initialEntries={['/members']}>
      <Routes>
        <Route path="/members" element={<Members />} />
        <Route path="/members/:id" element={<div>Member Details Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Members screen (S6, T-S6-1)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(plansApi.getPlans).mockResolvedValue({
      data: [
        {
          id: 'plan-1',
          gym_id: 'gym-1',
          name: 'Student',
          price: 250,
          benefits: null,
          status: 'active',
          created_at: '2026-10-28T00:00:00Z',
          memberCount: 1,
        },
      ],
      error: null,
    })
  })

  it('T-S6-1 shows loading placeholder with 3 grey rows', () => {
    vi.mocked(membersApi.listMembers).mockReturnValue(new Promise(() => {}))

    renderMembers()

    expect(screen.getByTestId('loading-placeholders')).toBeInTheDocument()
  })

  it('T-S6-1 shows empty state when no members exist', async () => {
    vi.mocked(membersApi.listMembers).mockResolvedValue({
      data: [],
      error: null,
    })

    renderMembers()

    await waitFor(() => {
      expect(screen.getByText('No Members yet. Add your first Member.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add member' })).toBeInTheDocument()
    })
  })

  it('T-S6-1 lists members and navigates to member details on row click', async () => {
    vi.mocked(membersApi.listMembers).mockResolvedValue({
      data: mockMembersList,
      error: null,
    })

    renderMembers()

    await waitFor(() => {
      expect(screen.getByText('Naledi Khumalo')).toBeInTheDocument()
      expect(screen.getByText('Thando Mokoena')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Naledi Khumalo'))
    expect(screen.getByText('Member Details Page')).toBeInTheDocument()
  })

  it('T-S6-1 Add member button opens M1 and displays toast on save', async () => {
    vi.mocked(membersApi.listMembers).mockResolvedValue({
      data: mockMembersList,
      error: null,
    })
    vi.mocked(membersApi.addMember).mockResolvedValue({
      data: {
        id: 'new-id',
        gym_id: 'gym-1',
        user_id: null,
        full_name: 'Ayesha Patel',
        email: 'ayesha.p@example.com',
        phone: null,
        plan_id: 'plan-1',
        paid_until: null,
        is_18_or_older: true,
        created_at: '2026-10-28T00:00:00Z',
      },
      error: null,
    })

    renderMembers()

    await screen.findByText('Naledi Khumalo')

    fireEvent.click(screen.getByRole('button', { name: 'Add member' }))
    expect(screen.getByRole('heading', { name: 'Add member' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Ayesha Patel' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ayesha.p@example.com' } })
    fireEvent.change(screen.getByLabelText('Plan'), { target: { value: 'plan-1' } })
    fireEvent.click(screen.getByLabelText('This Member is 18 or older'))

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText(messages.memberAdded)).toBeInTheDocument()
    })
  })

  it('T-US11-1 & T-BR9-3 searches members when typing >= 2 chars', async () => {
    vi.mocked(membersApi.listMembers).mockResolvedValueOnce({
      data: mockMembersList,
      error: null,
    }).mockResolvedValueOnce({
      data: [mockMembersList[1]], // Thando
      error: null,
    })

    renderMembers()

    await screen.findByText('Naledi Khumalo')

    const searchInput = screen.getByPlaceholderText(/search by name or email/i)
    fireEvent.change(searchInput, { target: { value: 'th' } })

    await waitFor(() => {
      expect(membersApi.listMembers).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'th' })
      )
    })
  })

  it('T-US11-2 & T-BR9-4 filters members by status chips', async () => {
    vi.mocked(membersApi.listMembers).mockResolvedValueOnce({
      data: mockMembersList,
      error: null,
    }).mockResolvedValueOnce({
      data: [mockMembersList[1]],
      error: null,
    })

    renderMembers()

    await screen.findByText('Naledi Khumalo')

    // Find and click "Grace period" filter chip
    const graceChip = screen.getByRole('button', { name: /^grace period$/i })
    fireEvent.click(graceChip)

    await waitFor(() => {
      expect(membersApi.listMembers).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'grace' })
      )
    })
  })

  it('T-US11-3 displays "No Members found. Check the spelling or tap Add member." when search has no match', async () => {
    vi.mocked(membersApi.listMembers).mockResolvedValueOnce({
      data: mockMembersList,
      error: null,
    }).mockResolvedValueOnce({
      data: [],
      error: null,
    })

    renderMembers()

    await screen.findByText('Naledi Khumalo')

    const searchInput = screen.getByPlaceholderText(/search by name or email/i)
    fireEvent.change(searchInput, { target: { value: 'zzzzz' } })

    await waitFor(() => {
      expect(
        screen.getByText('No Members found. Check the spelling or tap Add member.')
      ).toBeInTheDocument()
    })
  })
})

