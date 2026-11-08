import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OfflineBanner } from '../../src/components/OfflineBanner'
import * as useOnlineModule from '../../src/hooks/useOnline'

describe('T-C-5 OfflineBanner component', () => {
  it('is visible with exact text when offline', () => {
    vi.spyOn(useOnlineModule, 'useOnline').mockReturnValue(false)
    render(<OfflineBanner />)
    const banner = screen.getByRole('alert')
    expect(banner).toBeInTheDocument()
    expect(banner).toHaveTextContent("You're offline. Changes will not be saved.")
  })

  it('is hidden when online', () => {
    vi.spyOn(useOnlineModule, 'useOnline').mockReturnValue(true)
    render(<OfflineBanner />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

