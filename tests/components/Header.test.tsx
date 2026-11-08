import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '../../src/components/Header'

describe('T-C-10 Header component', () => {
  it('shows title and back arrow calling onBack with screen-reader label', async () => {
    const onBack = vi.fn()
    render(<Header title="Create account" onBack={onBack} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Create account')
    const backBtn = screen.getByRole('button', { name: 'Go back' })
    expect(backBtn).toBeInTheDocument()
    await userEvent.click(backBtn)
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('shows close icon calling onClose with screen-reader label', async () => {
    const onClose = vi.fn()
    render(<Header title="Member Form" onClose={onClose} />)

    const closeBtn = screen.getByRole('button', { name: 'Close' })
    expect(closeBtn).toBeInTheDocument()
    await userEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

