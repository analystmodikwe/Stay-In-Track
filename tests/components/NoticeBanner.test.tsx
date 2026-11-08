import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NoticeBanner } from '../../src/components/NoticeBanner'
import { AlertCircle } from 'lucide-react'

describe('T-C-9 NoticeBanner component', () => {
  it('shows icon and text, and is not tappable', () => {
    render(
      <NoticeBanner
        icon={AlertCircle}
        text="Your membership has expired. Please pay at the gym to get access again."
        variant="error"
      />
    )

    const banner = screen.getByRole('status')
    expect(banner).toBeInTheDocument()
    expect(banner).toHaveTextContent('Your membership has expired. Please pay at the gym to get access again.')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

