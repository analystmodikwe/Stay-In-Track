import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlanCard } from '../../src/components/PlanCard'

describe('PlanCard component (T-C-15)', () => {
  it('T-C-15 displays name, price, benefits, status, member count and triggers onClick', () => {
    const handleClick = vi.fn()
    render(
      <PlanCard
        name="Standard"
        price={350}
        benefits="Gym floor access, 1 fitness assessment"
        status="active"
        memberCount={1}
        onClick={handleClick}
      />
    )

    expect(screen.getByText('Standard')).toBeInTheDocument()
    expect(screen.getByText('R350.00 per month')).toBeInTheDocument()
    expect(screen.getByText('Gym floor access, 1 fitness assessment')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('1 member')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('T-C-15 displays Inactive status and plural members correctly', () => {
    render(
      <PlanCard
        name="Student"
        price={250}
        benefits={null}
        status="inactive"
        memberCount={2}
        onClick={() => {}}
      />
    )

    expect(screen.getByText('Student')).toBeInTheDocument()
    expect(screen.getByText('R250.00 per month')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
    expect(screen.getByText('2 members')).toBeInTheDocument()
  })
})

