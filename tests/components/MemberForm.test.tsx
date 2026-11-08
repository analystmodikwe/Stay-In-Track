import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemberFormModal } from '../../src/modals/MemberForm'
import { messages } from '../../src/lib/messages'
import { Plan } from '../../src/lib/api/plans'

const mockPlans: Plan[] = [
  {
    id: 'plan-1',
    gym_id: 'gym-1',
    name: 'Student',
    price: 250,
    benefits: 'Floor access',
    status: 'active',
    created_at: '2026-10-28T00:00:00Z',
    memberCount: 2,
  },
  {
    id: 'plan-2',
    gym_id: 'gym-1',
    name: 'Old Plan',
    price: 300,
    benefits: 'Legacy',
    status: 'inactive',
    created_at: '2026-10-28T00:00:00Z',
    memberCount: 0,
  },
]

describe('MemberFormModal (M1)', () => {
  it('T-US5-1 renders add mode, fills form, and submits successfully', async () => {
    const handleSave = vi.fn().mockResolvedValue({ error: null })
    const handleClose = vi.fn()

    render(
      <MemberFormModal
        isOpen={true}
        plans={mockPlans}
        onClose={handleClose}
        onSave={handleSave}
      />
    )

    expect(screen.getByRole('heading', { name: 'Add member' })).toBeInTheDocument()

    // Fill form
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Naledi Khumalo' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'naledi.k@example.com' } })
    fireEvent.change(screen.getByLabelText('Phone (optional)'), { target: { value: '+27 82 555 0147' } })
    fireEvent.change(screen.getByLabelText('Plan'), { target: { value: 'plan-1' } })
    fireEvent.click(screen.getByLabelText('This Member is 18 or older'))

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalledWith({
        full_name: 'Naledi Khumalo',
        email: 'naledi.k@example.com',
        phone: '+27825550147',
        plan_id: 'plan-1',
        is_18_or_older: true,
      })
    })
  })

  it('T-US5-2 displays duplicate member error under email field', async () => {
    const handleSave = vi.fn().mockResolvedValue({ error: messages.duplicateMember })

    render(
      <MemberFormModal
        isOpen={true}
        plans={mockPlans}
        onClose={() => {}}
        onSave={handleSave}
      />
    )

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Naledi Khumalo' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'naledi.k@example.com' } })
    fireEvent.change(screen.getByLabelText('Plan'), { target: { value: 'plan-1' } })
    fireEvent.click(screen.getByLabelText('This Member is 18 or older'))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText(messages.duplicateMember)).toBeInTheDocument()
    })
  })

  it('T-US5-3 displays 500 member limit error', async () => {
    const handleSave = vi.fn().mockResolvedValue({ error: messages.memberLimit })

    render(
      <MemberFormModal
        isOpen={true}
        plans={mockPlans}
        onClose={() => {}}
        onSave={handleSave}
      />
    )

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Test 501' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test501@example.com' } })
    fireEvent.change(screen.getByLabelText('Plan'), { target: { value: 'plan-1' } })
    fireEvent.click(screen.getByLabelText('This Member is 18 or older'))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText(messages.memberLimit)).toBeInTheDocument()
    })
  })

  it('T-M1-1 lists only Active plans in dropdown, opens with member values, and closes on close icon', async () => {
    const handleClose = vi.fn()
    const handleSave = vi.fn()

    const memberToEdit = {
      id: 'member-1',
      gym_id: 'gym-1',
      user_id: null,
      full_name: 'Johan van der Merwe',
      email: 'johan.vdm@example.com',
      phone: '+27821234567',
      plan_id: 'plan-1',
      paid_until: '2026-12-01',
      is_18_or_older: true,
      created_at: '2026-10-28T00:00:00Z',
    }

    render(
      <MemberFormModal
        isOpen={true}
        member={memberToEdit}
        plans={mockPlans}
        onClose={handleClose}
        onSave={handleSave}
      />
    )

    expect(screen.getByRole('heading', { name: 'Edit member' })).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toHaveValue('Johan van der Merwe')
    expect(screen.getByLabelText('Email')).toHaveValue('johan.vdm@example.com')
    expect(screen.getByLabelText('Phone (optional)')).toHaveValue('+27 82 123 4567')

    // Only active plans shown
    expect(screen.getByText('Student')).toBeInTheDocument()
    expect(screen.queryByText('Old Plan')).not.toBeInTheDocument()

    // Close button
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(handleClose).toHaveBeenCalled()
    expect(handleSave).not.toHaveBeenCalled()
  })

  it('T-US6-3 disables Email field with warning text when Member has an account (user_id set)', () => {
    const memberWithAccount = {
      id: 'member-1',
      gym_id: 'gym-1',
      user_id: 'auth-user-123',
      full_name: 'Naledi Khumalo',
      email: 'naledi.k@example.com',
      phone: null,
      plan_id: 'plan-1',
      paid_until: '2026-11-15',
      is_18_or_older: true,
      created_at: '2026-10-28T00:00:00Z',
    }

    render(
      <MemberFormModal
        isOpen={true}
        member={memberWithAccount}
        plans={mockPlans}
        onClose={() => {}}
        onSave={vi.fn()}
      />
    )

    const emailInput = screen.getByLabelText('Email')
    expect(emailInput).toBeDisabled()
    expect(screen.getByText(messages.emailLocked)).toBeInTheDocument()
  })
})

