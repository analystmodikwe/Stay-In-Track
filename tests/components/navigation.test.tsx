/**
 * T-NAV-1  Logged out: only S1–S4 and S11 open; others redirect to S1
 * T-NAV-2  Admin opening S9 → own Dashboard with "You can't do that."
 *           Member opening S5–S8 → own Dashboard with "You can't do that."
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../src/App'

// Mock useSession to control auth state
vi.mock('../../src/hooks/useSession', () => ({
  useSession: vi.fn(),
}))

import { useSession } from '../../src/hooks/useSession'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  )
}

describe('T-NAV-1 Navigation — logged out', () => {
  beforeEach(() => {
    vi.mocked(useSession).mockReturnValue({ session: null, loading: false })
  })

  it('T-NAV-1a / opens Welcome', () => {
    renderAt('/')
    expect(screen.getByText('STAY IN TRACK')).toBeInTheDocument()
  })

  it('T-NAV-1b /sign-up opens Sign Up', () => {
    renderAt('/sign-up')
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('T-NAV-1c /log-in opens Log In', () => {
    renderAt('/log-in')
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('T-NAV-1d /forgot-password opens Forgot Password', () => {
    renderAt('/forgot-password')
    expect(screen.getByRole('button', { name: /send link/i })).toBeInTheDocument()
  })

  it('T-NAV-1e /privacy opens Privacy Notice', () => {
    renderAt('/privacy')
    expect(screen.getByText(/what we collect/i)).toBeInTheDocument()
  })

  it('T-NAV-1f /dashboard while logged out → redirects to /', () => {
    renderAt('/dashboard')
    // Should show Welcome (the redirect target)
    expect(screen.getByText('STAY IN TRACK')).toBeInTheDocument()
  })

  it('T-NAV-1g /home while logged out → redirects to /', () => {
    renderAt('/home')
    expect(screen.getByText('STAY IN TRACK')).toBeInTheDocument()
  })

  it('T-NAV-1h /settings while logged out → redirects to /', () => {
    renderAt('/settings')
    expect(screen.getByText('STAY IN TRACK')).toBeInTheDocument()
  })
})

describe('T-NAV-2 Navigation — role guards', () => {
  it('T-NAV-2a Admin opening S1 → redirects to /dashboard', () => {
    vi.mocked(useSession).mockReturnValue({
      session: { user: { user_metadata: { role: 'admin' } } } as never,
      loading: false,
    })
    renderAt('/')
    // Should land on the Admin Dashboard
    expect(screen.getByRole('heading', { name: /^dashboard$/i })).toBeInTheDocument()
  })

  it('T-NAV-2b Member opening S1 → redirects to /home', () => {
    vi.mocked(useSession).mockReturnValue({
      session: { user: { user_metadata: { role: 'member' } } } as never,
      loading: false,
    })
    renderAt('/')
    expect(screen.getByText(/member dashboard/i)).toBeInTheDocument()
  })

  it('T-NAV-2c Admin opening /home → redirects to /dashboard with "You can\'t do that."', () => {
    vi.mocked(useSession).mockReturnValue({
      session: { user: { user_metadata: { role: 'admin' } } } as never,
      loading: false,
    })
    renderAt('/home')
    expect(screen.getByText("You can't do that.")).toBeInTheDocument()
  })

  it('T-NAV-2d Member opening /dashboard → redirects to /home with "You can\'t do that."', () => {
    vi.mocked(useSession).mockReturnValue({
      session: { user: { user_metadata: { role: 'member' } } } as never,
      loading: false,
    })
    renderAt('/dashboard')
    expect(screen.getByText("You can't do that.")).toBeInTheDocument()
  })
})
