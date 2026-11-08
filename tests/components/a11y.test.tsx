import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '../../src/components/Header'
import { TextField } from '../../src/components/TextField'
import { StatusBadge } from '../../src/components/StatusBadge'
import { Button } from '../../src/components/Button'

describe('Accessibility (T-NFR-3 / PRD 9.4)', () => {
  it('ensures icon-only buttons have accessible screen-reader labels', () => {
    render(<Header title="Test Title" onBack={vi.fn()} />)
    const backBtn = screen.getByRole('button', { name: /back/i })
    expect(backBtn).toHaveAttribute('aria-label', expect.stringMatching(/back/i))
  })

  it('ensures password toggle button has screen-reader label', () => {
    render(
      <TextField
        id="pwd"
        label="Password"
        type="password"
        value="secret"
        onChange={vi.fn()}
      />
    )
    const toggleBtn = screen.getByRole('button', { name: /show password/i })
    expect(toggleBtn).toBeInTheDocument()
    expect(toggleBtn).toHaveAttribute('aria-label')
  })

  it('ensures primary and secondary buttons have minimum height 48px for touch targets', () => {
    const { container: c1 } = render(<Button variant="primary">Submit</Button>)
    const btn1 = c1.querySelector('button')
    expect(btn1?.className).toMatch(/h-12|min-h-\[48px\]/)

    const { container: c2 } = render(<Button variant="secondary">Cancel</Button>)
    const btn2 = c2.querySelector('button')
    expect(btn2?.className).toMatch(/h-12|min-h-\[48px\]/)
  })

  it('ensures field errors display red border and error message text', () => {
    render(
      <TextField
        id="name"
        label="Full name"
        value=""
        onChange={vi.fn()}
        error="Enter a name between 2 and 60 characters."
      />
    )
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('border-error')
    expect(screen.getByText('Enter a name between 2 and 60 characters.')).toBeInTheDocument()
  })

  it('ensures StatusBadges always show both icon and text (never colour alone)', () => {
    const statuses: Array<'active' | 'grace' | 'overdue'> = ['active', 'grace', 'overdue']
    const labels = {
      active: 'Active',
      grace: 'Grace period',
      overdue: 'Overdue',
    }

    statuses.forEach((status) => {
      const { container } = render(<StatusBadge status={status} />)
      expect(screen.getByText(labels[status])).toBeInTheDocument()
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  it('ensures clickable inputs and buttons have focus styles with teal outline', () => {
    const { container } = render(
      <TextField
        id="focus-test"
        label="Test"
        value=""
        onChange={vi.fn()}
      />
    )
    const input = container.querySelector('input')
    expect(input?.className).toMatch(/focus(-visible)?:ring-2.*focus(-visible)?:ring-accent/)
  })
})
