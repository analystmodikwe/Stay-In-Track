/**
 * Component test for PaymentRow (T-C-16):
 * - Date, amount "R350.00", method, months ("1 month", "2 months")
 * - "Undo" only when passed / canUndo is true
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PaymentRow from '../../src/components/PaymentRow'

describe('PaymentRow component (T-C-16)', () => {
  const samplePayment = {
    id: 'pay-123',
    gym_id: 'gym-1',
    member_id: 'mem-1',
    amount: 350,
    method: 'Cash',
    months: 1,
    payment_date: '2026-09-26',
    previous_paid_until: '2026-08-26',
    recorded_by: 'admin-1',
    created_at: '2026-09-26T10:00:00Z',
  }

  it('renders payment date, amount, method, and months format', () => {
    render(<PaymentRow payment={samplePayment} canUndo={false} />)

    expect(screen.getByText(/26 Sept? 2026/i)).toBeInTheDocument()
    expect(screen.getByText('R350.00')).toBeInTheDocument()
    expect(screen.getByText(/Cash/)).toBeInTheDocument()
    expect(screen.getByText(/1 month/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /undo/i })).not.toBeInTheDocument()
  })

  it('renders plural "months" when months > 1', () => {
    render(<PaymentRow payment={{ ...samplePayment, months: 2, amount: 700 }} canUndo={false} />)

    expect(screen.getByText('R700.00')).toBeInTheDocument()
    expect(screen.getByText(/2 months/)).toBeInTheDocument()
  })

  it('shows Undo button when canUndo is true and calls onUndo when clicked', () => {
    const handleUndo = vi.fn()
    render(<PaymentRow payment={samplePayment} canUndo={true} onUndo={handleUndo} />)

    const undoBtn = screen.getByRole('button', { name: /undo/i })
    expect(undoBtn).toBeInTheDocument()

    fireEvent.click(undoBtn)
    expect(handleUndo).toHaveBeenCalledTimes(1)
  })
})

