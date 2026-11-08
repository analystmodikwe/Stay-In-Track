import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../../src/components/StatusBadge'

describe('T-C-11 StatusBadge component', () => {
  it('shows Active with icon, text and green styling', () => {
    render(<StatusBadge status="active" />)
    const badge = screen.getByLabelText('Active')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Active')
    expect(badge).toHaveStyle({ backgroundColor: '#E3F4E6', color: '#1B5E20' })
  })

  it('shows Grace period with icon, text and amber styling', () => {
    render(<StatusBadge status="grace" />)
    const badge = screen.getByLabelText('Grace period')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Grace period')
    expect(badge).toHaveStyle({ backgroundColor: '#FFF3CD', color: '#7A4B00' })
  })

  it('shows Overdue with icon, text and red styling', () => {
    render(<StatusBadge status="overdue" />)
    const badge = screen.getByLabelText('Overdue')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Overdue')
    expect(badge).toHaveStyle({ backgroundColor: '#FBE3E3', color: '#9B1C1C' })
  })
})

