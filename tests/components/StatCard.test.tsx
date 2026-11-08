/**
 * Component test for StatCard (T-C-14):
 * - Label and large number (28px bold); not tappable
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from '../../src/components/StatCard'

describe('StatCard component (T-C-14)', () => {
  it('renders label and value, and has no interactive button/link role', () => {
    render(<StatCard label="Total Members" value="4" />)

    expect(screen.getByText('Total Members')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders formatted string value like revenue', () => {
    render(<StatCard label="Revenue this month" value="R1,350.00" />)

    expect(screen.getByText('Revenue this month')).toBeInTheDocument()
    expect(screen.getByText('R1,350.00')).toBeInTheDocument()
  })
})

