/**
 * T-S10-1  Settings screen (shell) — Phase 3
 * Shows Account name and email (read-only), Privacy Notice row → S11,
 * Logout → S1 (no confirm), Delete account → M4.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Settings } from '../../src/pages/Settings'

vi.mock('../../src/lib/api/auth', () => ({
  logOut: vi.fn(),
  deleteAccount: vi.fn(),
}))

vi.mock('../../src/hooks/useSession', () => ({
  useSession: vi.fn(),
}))

import { useSession } from '../../src/hooks/useSession'
import * as authApi from '../../src/lib/api/auth'

function renderSettings(role: 'admin' | 'member' = 'admin') {
  vi.mocked(useSession).mockReturnValue({
    session: {
      user: {
        email: 'sipho@example.com',
        user_metadata: { full_name: 'Sipho Dlamini', role },
      },
    } as never,
    loading: false,
  })

  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<div>Welcome</div>} />
        <Route path="/privacy" element={<div>Privacy Notice</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('T-S10-1 Settings screen (shell)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('T-S10-1a shows the account name (read-only)', () => {
    renderSettings()
    expect(screen.getByText('Sipho Dlamini')).toBeInTheDocument()
  })

  it('T-S10-1b shows the account email (read-only)', () => {
    renderSettings()
    expect(screen.getByText('sipho@example.com')).toBeInTheDocument()
  })

  it('T-S10-1c has a "Privacy Notice" row that links to S11', async () => {
    renderSettings()
    const link = screen.getByRole('link', { name: /privacy notice/i })
    expect(link).toBeInTheDocument()
    await userEvent.click(link)
    await waitFor(() =>
      expect(screen.getByText('Privacy Notice')).toBeInTheDocument()
    )
  })

  it('T-S10-1d "Logout" logs out and goes to S1 with no confirmation', async () => {
    vi.mocked(authApi.logOut).mockResolvedValueOnce({ error: null })
    renderSettings()
    await userEvent.click(screen.getByRole('button', { name: /logout/i }))
    await waitFor(() => expect(authApi.logOut).toHaveBeenCalledOnce())
    // No confirmation dialog should appear
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    // Navigated to Welcome
    await waitFor(() => expect(screen.getByText('Welcome')).toBeInTheDocument())
  })

  it('T-S10-1e "Delete account" button opens M4', async () => {
    renderSettings()
    await userEvent.click(screen.getByRole('button', { name: /delete account/i }))
    await waitFor(() =>
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    )
  })
})

