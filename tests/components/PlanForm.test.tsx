import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PlanFormModal } from '../../src/modals/PlanForm'
import { messages } from '../../src/lib/messages'

describe('PlanFormModal component (M2)', () => {
  it('T-US7-1 renders in add mode, validates inputs, and submits successfully', async () => {
    const handleSave = vi.fn().mockResolvedValue({ error: null })
    const handleClose = vi.fn()

    render(
      <PlanFormModal
        isOpen={true}
        onClose={handleClose}
        onSave={handleSave}
      />
    )

    expect(screen.getByRole('heading', { name: 'Add plan' })).toBeInTheDocument()

    // Form inputs
    const nameInput = screen.getByLabelText('Plan name')
    const priceInput = screen.getByLabelText('Price per month (R)')
    const benefitsInput = screen.getByLabelText('Benefits (optional)')
    const saveButton = screen.getByRole('button', { name: 'Save' })

    fireEvent.change(nameInput, { target: { value: 'Standard' } })
    fireEvent.change(priceInput, { target: { value: '350' } })
    fireEvent.change(benefitsInput, { target: { value: 'Gym floor access, 1 fitness assessment' } })

    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalledWith({
        name: 'Standard',
        price: 350,
        benefits: 'Gym floor access, 1 fitness assessment',
        status: 'active',
      })
    })
  })

  it('T-US7-2 displays duplicate plan error returned from backend under Name field', async () => {
    const handleSave = vi.fn().mockResolvedValue({
      error: messages.duplicatePlan,
    })

    render(
      <PlanFormModal
        isOpen={true}
        onClose={() => {}}
        onSave={handleSave}
      />
    )

    fireEvent.change(screen.getByLabelText('Plan name'), { target: { value: 'Standard' } })
    fireEvent.change(screen.getByLabelText('Price per month (R)'), { target: { value: '350' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText(messages.duplicatePlan)).toBeInTheDocument()
    })
  })

  it('T-US7-3 validates price field boundaries in UI', async () => {
    const handleSave = vi.fn()

    render(
      <PlanFormModal
        isOpen={true}
        onClose={() => {}}
        onSave={handleSave}
      />
    )

    const priceInput = screen.getByLabelText('Price per month (R)')
    const saveButton = screen.getByRole('button', { name: 'Save' })

    fireEvent.change(screen.getByLabelText('Plan name'), { target: { value: 'Valid Plan' } })
    fireEvent.change(priceInput, { target: { value: '0' } })
    fireEvent.click(saveButton)

    expect(screen.getByText(messages.planPriceError)).toBeInTheDocument()
    expect(handleSave).not.toHaveBeenCalled()

    fireEvent.change(priceInput, { target: { value: '5001' } })
    fireEvent.click(saveButton)

    expect(screen.getByText(messages.planPriceError)).toBeInTheDocument()
    expect(handleSave).not.toHaveBeenCalled()
  })

  it('T-M2-1 renders in edit mode, toggles Active to Inactive, and close icon closes without saving', async () => {
    const handleSave = vi.fn().mockResolvedValue({ error: null })
    const handleClose = vi.fn()

    const initialPlan = {
      id: 'plan-1',
      gym_id: 'gym-1',
      name: 'Premium',
      price: 550,
      benefits: 'Gym floor access, group classes',
      status: 'active' as const,
      created_at: '2026-10-28T12:00:00Z',
      memberCount: 3,
    }

    render(
      <PlanFormModal
        isOpen={true}
        plan={initialPlan}
        onClose={handleClose}
        onSave={handleSave}
      />
    )

    expect(screen.getByRole('heading', { name: 'Edit plan' })).toBeInTheDocument()
    expect(screen.getByLabelText('Plan name')).toHaveValue('Premium')
    expect(screen.getByLabelText('Price per month (R)')).toHaveValue(550)
    expect(screen.getByLabelText('Benefits (optional)')).toHaveValue('Gym floor access, group classes')

    // Active toggle
    const activeToggle = screen.getByRole('switch', { name: /active/i })
    expect(activeToggle).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(activeToggle)
    expect(activeToggle).toHaveAttribute('aria-checked', 'false')

    // Close button
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    expect(handleClose).toHaveBeenCalled()
    expect(handleSave).not.toHaveBeenCalled()
  })
})

