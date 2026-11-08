import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextField } from '../../src/components/TextField'

describe('T-C-2 TextField component', () => {
  it('shows red border and error text when error is set', () => {
    render(<TextField label="Email" error="Invalid email address" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input.className).toContain('border-error')
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email address')
  })

  it('eye icon toggles password visibility', async () => {
    render(<TextField label="Password" type="password" />)
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')

    const toggleBtn = screen.getByRole('button', { name: 'Show password' })
    await userEvent.click(toggleBtn)
    expect(input).toHaveAttribute('type', 'text')

    const hideBtn = screen.getByRole('button', { name: 'Hide password' })
    await userEvent.click(hideBtn)
    expect(input).toHaveAttribute('type', 'password')
  })
})

