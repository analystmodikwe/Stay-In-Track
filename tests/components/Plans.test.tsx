import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Plans } from '../../src/pages/Plans'
import * as plansApi from '../../src/lib/api/plans'
import { messages } from '../../src/lib/messages'

vi.mock('../../src/lib/api/plans')

function renderPlans() {
  return render(
    <MemoryRouter>
      <Plans />
    </MemoryRouter>
  )
}

describe('Plans screen (S8, T-S8-1)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('T-S8-1 shows loading placeholder with 3 grey cards', () => {
    vi.mocked(plansApi.getPlans).mockReturnValue(new Promise(() => {}))

    renderPlans()

    expect(screen.getByTestId('loading-placeholders')).toBeInTheDocument()
  })

  it('T-S8-1 shows empty state when no plans exist', async () => {
    vi.mocked(plansApi.getPlans).mockResolvedValue({ data: [], error: null })

    renderPlans()

    await waitFor(() => {
      expect(screen.getByText('No Plans yet. Add your first Plan.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add plan' })).toBeInTheDocument()
    })
  })

  it('T-S8-1 shows error state when fetching plans fails', async () => {
    vi.mocked(plansApi.getPlans).mockResolvedValue({
      data: null,
      error: messages.serverError,
    })

    renderPlans()

    await waitFor(() => {
      expect(screen.getByText(messages.serverError)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    })
  })

  it('T-S8-1 shows plans list with member counts, active/inactive badges, and opens modal on click', async () => {
    const mockPlans: plansApi.Plan[] = [
      {
        id: 'plan-1',
        gym_id: 'gym-1',
        name: 'Student',
        price: 250,
        benefits: 'Gym floor access',
        status: 'active' as const,
        created_at: '2026-10-28T12:00:00Z',
        memberCount: 2,
      },
      {
        id: 'plan-2',
        gym_id: 'gym-1',
        name: 'Standard',
        price: 350,
        benefits: 'Gym floor access, 1 fitness assessment',
        status: 'active' as const,
        created_at: '2026-10-28T12:00:00Z',
        memberCount: 1,
      },
    ]

    vi.mocked(plansApi.getPlans).mockResolvedValue({ data: mockPlans, error: null })

    renderPlans()

    await waitFor(() => {
      expect(screen.getByText('Student')).toBeInTheDocument()
      expect(screen.getByText('R250.00 per month')).toBeInTheDocument()
      expect(screen.getByText('2 members')).toBeInTheDocument()

      expect(screen.getByText('Standard')).toBeInTheDocument()
      expect(screen.getByText('R350.00 per month')).toBeInTheDocument()
      expect(screen.getByText('1 member')).toBeInTheDocument()
    })

    // Clicking a plan card opens edit modal
    fireEvent.click(screen.getByText('Student'))
    expect(screen.getByRole('heading', { name: 'Edit plan' })).toBeInTheDocument()
  })

  it('T-S8-1 floating Add plan button opens Add plan modal and shows toast on save', async () => {
    vi.mocked(plansApi.getPlans).mockResolvedValue({ data: [], error: null })
    vi.mocked(plansApi.createPlan).mockResolvedValue({
      data: {
        id: 'new-id',
        gym_id: 'gym-1',
        name: 'Premium',
        price: 550,
        benefits: null,
        status: 'active',
        created_at: '2026-10-28T12:00:00Z',
        memberCount: 0,
      },
      error: null,
    })

    renderPlans()

    await waitFor(() => {
      expect(screen.getByText('No Plans yet. Add your first Plan.')).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'Add plan' })[0])
    expect(screen.getByRole('heading', { name: 'Add plan' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Plan name'), { target: { value: 'Premium' } })
    fireEvent.change(screen.getByLabelText('Price per month (R)'), { target: { value: '550' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText(messages.planSaved)).toBeInTheDocument()
    })
  })
})

