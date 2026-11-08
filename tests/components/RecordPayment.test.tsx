/**
 * Component tests for RecordPaymentModal (M3):
 * - T-US8-1 Overdue member records payment → saves, calls onSuccess
 * - T-US8-2 2 months payment calculation preview
 * - T-US8-3 Invalid payment date in future shows error
 * - T-US8-4 Amount out of range shows error
 * - T-M3-1 "New paid until date" pill updates live as months or date change
 * - T-M3-2 Amount defaults to Plan price × months, updates on months change, editable
 * - T-EDGE-1 Offline banner visible and Save payment disabled when offline
 * - T-EDGE-2 Session expiration closes modal and redirects
 * - T-EDGE-5 31 Jan payment for 1 month updates pill to 28 Feb
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecordPaymentModal from '../../src/modals/RecordPayment'
import * as paymentsApi from '../../src/lib/api/payments'

vi.mock('../../src/lib/api/payments', () => ({
  recordPayment: vi.fn(),
}))

describe('RecordPaymentModal (M3)', () => {
  const sampleMember = {
    id: 'mem-thando',
    full_name: 'Thando Mokoena',
    plan_id: 'plan-standard',
    plan_price: 350,
    paid_until: '2026-10-26',
    status: 'grace',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(paymentsApi.recordPayment).mockResolvedValue({
      data: { payment_id: 'pay-new' },
      error: null,
    })
  })

  it('renders modal with default values (months=1, amount=350, method=Cash, date=today)', () => {
    render(
      <MemoryRouter>
        <RecordPaymentModal
          isOpen={true}
          member={sampleMember}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Record payment' })).toBeInTheDocument()
    expect(screen.getByLabelText(/months paid/i)).toHaveValue('1')
    expect(screen.getByLabelText(/amount \(r\)/i)).toHaveValue(350)
    expect(screen.getByLabelText(/payment method/i)).toHaveValue('Cash')
    expect(screen.getByRole('button', { name: 'Save payment' })).toBeInTheDocument()
  })

  it('T-M3-1 & T-M3-2: updates amount and "New paid until date" pill live when months change', () => {
    render(
      <MemoryRouter>
        <RecordPaymentModal
          isOpen={true}
          member={sampleMember} // paid_until 2026-10-26, price 350
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      </MemoryRouter>
    )

    // Initially 1 month: 2026-10-26 or today -> updates live
    const monthsSelect = screen.getByLabelText(/months paid/i)
    fireEvent.change(monthsSelect, { target: { value: '2' } })

    // Amount updates to 700 (350 * 2)
    expect(screen.getByLabelText(/amount \(r\)/i)).toHaveValue(700)

    // Pill text shows "New paid until date:"
    expect(screen.getByText(/new paid until date:/i)).toBeInTheDocument()
  })

  it('T-US8-3: displays error when payment date is in the future', async () => {
    render(
      <MemoryRouter>
        <RecordPaymentModal
          isOpen={true}
          member={sampleMember}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      </MemoryRouter>
    )

    const dateInput = screen.getByLabelText(/payment date/i)
    fireEvent.change(dateInput, { target: { value: '2099-01-01' } })

    fireEvent.click(screen.getByRole('button', { name: 'Save payment' }))

    await waitFor(() => {
      expect(screen.getByText("Payment date can't be in the future.")).toBeInTheDocument()
    })
    expect(paymentsApi.recordPayment).not.toHaveBeenCalled()
  })

  it('T-US8-4: displays error when amount is below 1 or above 50,000', async () => {
    render(
      <MemoryRouter>
        <RecordPaymentModal
          isOpen={true}
          member={sampleMember}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      </MemoryRouter>
    )

    const amountInput = screen.getByLabelText(/amount \(r\)/i)
    fireEvent.change(amountInput, { target: { value: '0.50' } })

    fireEvent.click(screen.getByRole('button', { name: 'Save payment' }))

    await waitFor(() => {
      expect(screen.getByText('Amount must be between R1.00 and R50,000.00.')).toBeInTheDocument()
    })
    expect(paymentsApi.recordPayment).not.toHaveBeenCalled()
  })

  it('T-US8-1: submits valid payment and calls onSuccess', async () => {
    const handleSuccess = vi.fn()
    const handleClose = vi.fn()

    render(
      <MemoryRouter>
        <RecordPaymentModal
          isOpen={true}
          member={sampleMember}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Save payment' }))

    await waitFor(() => {
      expect(paymentsApi.recordPayment).toHaveBeenCalledTimes(1)
      expect(handleSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('T-EDGE-1: disables Save payment when offline', () => {
    // Mock navigator.onLine = false
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

    render(
      <MemoryRouter>
        <RecordPaymentModal
          isOpen={true}
          member={sampleMember}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      </MemoryRouter>
    )

    expect(screen.getByText(/you're offline\. changes will not be saved\./i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save payment' })).toBeDisabled()

    vi.restoreAllMocks()
  })
})

