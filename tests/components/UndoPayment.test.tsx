/**
 * Component tests for UndoPaymentModal (M6):
 * - T-US9-1 Undo latest payment → calls api, triggers onSuccess
 * - T-M6-1 Shows restored paid_until date (or "The Member goes back to No Payment yet.")
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UndoPaymentModal from '../../src/modals/UndoPayment'
import * as paymentsApi from '../../src/lib/api/payments'

vi.mock('../../src/lib/api/payments', () => ({
  undoPayment: vi.fn(),
}))

describe('UndoPaymentModal (M6)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(paymentsApi.undoPayment).mockResolvedValue({
      data: null,
      error: null,
    })
  })

  it('renders confirmation text with restored date when previous_paid_until exists', () => {
    const payment = {
      id: 'pay-1',
      previous_paid_until: '2026-10-10',
    }

    render(
      <UndoPaymentModal
        isOpen={true}
        payment={payment}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    )

    expect(screen.getByText('Undo this Payment?')).toBeInTheDocument()
    expect(
      screen.getByText('The paid until date goes back to 10 Oct 2026.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Undo Payment' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('renders "The Member goes back to No Payment yet." when previous_paid_until is null', () => {
    const payment = {
      id: 'pay-first',
      previous_paid_until: null,
    }

    render(
      <UndoPaymentModal
        isOpen={true}
        payment={payment}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    )

    expect(
      screen.getByText('The Member goes back to No Payment yet.')
    ).toBeInTheDocument()
  })

  it('calls undoPayment on danger button click and triggers onSuccess', async () => {
    const handleSuccess = vi.fn()
    const payment = {
      id: 'pay-123',
      previous_paid_until: '2026-10-10',
    }

    render(
      <UndoPaymentModal
        isOpen={true}
        payment={payment}
        onClose={vi.fn()}
        onSuccess={handleSuccess}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Undo Payment' }))

    await waitFor(() => {
      expect(paymentsApi.undoPayment).toHaveBeenCalledWith('pay-123')
      expect(handleSuccess).toHaveBeenCalledTimes(1)
    })
  })
})

