import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../../src/components/Button'

describe('T-C-1 Button component', () => {
  it('renders primary, secondary and danger variants with height min 48px', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    let btn = screen.getByRole('button', { name: 'Primary' })
    expect(btn).toBeInTheDocument()
    expect(btn.className).toContain('min-h-[48px]')
    expect(btn.className).toContain('bg-primary')

    rerender(<Button variant="secondary">Secondary</Button>)
    btn = screen.getByRole('button', { name: 'Secondary' })
    expect(btn.className).toContain('min-h-[48px]')
    expect(btn.className).toContain('bg-white')

    rerender(<Button variant="danger">Danger</Button>)
    btn = screen.getByRole('button', { name: 'Danger' })
    expect(btn.className).toContain('min-h-[48px]')
    expect(btn.className).toContain('bg-error')
  })

  it('cannot be pressed when disabled', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Disabled</Button>)
    const btn = screen.getByRole('button', { name: 'Disabled' })
    expect(btn).toBeDisabled()
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('shows spinner and blocks presses when loading', async () => {
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Submit</Button>)
    const btn = screen.getByRole('button', { name: 'Submit' })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })
})

