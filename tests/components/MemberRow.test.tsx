import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemberRow } from '../../src/components/MemberRow'

describe('MemberRow component (T-C-13)', () => {
  it('T-C-13 renders full name, plan name, status badge, paid-until date and triggers onClick', () => {
    const handleClick = vi.fn()
    render(
      <MemberRow
        fullName="Naledi Khumalo"
        planName="Student"
        status="active"
        paidUntil="2026-11-15"
        onClick={handleClick}
      />
    )

    expect(screen.getByText('Naledi Khumalo')).toBeInTheDocument()
    expect(screen.getByText(/Student/)).toBeInTheDocument()
    expect(screen.getByText(/Paid until 15 Nov 2026/)).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('T-C-13 shows No Payment yet when paidUntil is null', () => {
    render(
      <MemberRow
        fullName="New Member"
        planName="Standard"
        status="overdue"
        paidUntil={null}
        onClick={() => {}}
      />
    )

    expect(screen.getByText('New Member')).toBeInTheDocument()
    expect(screen.getByText(/No Payment yet/)).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })
})

