import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Toast } from '../../src/components/Toast'

describe('T-C-4 Toast component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows text and disappears after 3 seconds', () => {
    const onDismiss = vi.fn()
    render(<Toast text="Account deleted" onDismiss={onDismiss} duration={3000} />)

    expect(screen.getByRole('status')).toHaveTextContent('Account deleted')

    act(() => {
      vi.advanceTimersByTime(2999)
    })
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(onDismiss).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})

