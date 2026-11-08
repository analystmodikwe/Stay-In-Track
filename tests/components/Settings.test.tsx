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

vi.mock('../../src/lib/api/gym', () => ({
  getGym: vi.fn(),
  updateGracePeriod: vi.fn(),
}))

vi.mock('../../src/lib/api/member', () => ({
  getOwnMembership: vi.fn(),
  setReminders: vi.fn(),
}))

vi.mock('../../src/hooks/useSession', () => ({
  useSession: vi.fn(),
}))

vi.mock('../../src/hooks/useOnline', () => ({
  useOnline: vi.fn(() => true),
}))

import { useSession } from '../../src/hooks/useSession'
import { useOnline } from '../../src/hooks/useOnline'
import * as authApi from '../../src/lib/api/auth'
import * as gymApi from '../../src/lib/api/gym'
import * as memberApi from '../../src/lib/api/member'
import { messages } from '../../src/lib/messages'

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
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(gymApi.getGym).mockResolvedValue({
      data: { id: 'gym-1', name: 'Iron Haven Gym', grace_days: 3 },
      error: null,
    })
  })

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

  it('T-S10-2 Grace period field and Save show only for Admin, never for Member', async () => {
    vi.mocked(gymApi.getGym).mockResolvedValue({
      data: { id: 'gym-1', name: 'Iron Haven Gym', grace_days: 3 },
      error: null,
    })

    // Admin view
    const { unmount } = renderSettings('admin')
    await waitFor(() => {
      expect(screen.getByLabelText(/grace period/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })
    unmount()

    // Member view
    renderSettings('member')
    expect(screen.queryByLabelText(/grace period/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
  })

  it('T-US10-1 Admin updates Grace period successfully and sees toast', async () => {
    vi.mocked(gymApi.getGym).mockResolvedValue({
      data: { id: 'gym-1', name: 'Iron Haven Gym', grace_days: 3 },
      error: null,
    })
    vi.mocked(gymApi.updateGracePeriod).mockResolvedValue({ error: null })

    renderSettings('admin')

    const input = await screen.findByLabelText(/grace period/i)
    expect(input).toHaveValue(3)

    await userEvent.clear(input)
    await userEvent.type(input, '5')

    const saveButton = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(gymApi.updateGracePeriod).toHaveBeenCalledWith(5)
      expect(screen.getByText(messages.graceSaved)).toBeInTheDocument()
    })
  })

  it('T-US10-2 validates Grace period boundary (15 or empty -> error message)', async () => {
    vi.mocked(gymApi.getGym).mockResolvedValue({
      data: { id: 'gym-1', name: 'Iron Haven Gym', grace_days: 3 },
      error: null,
    })

    renderSettings('admin')

    const input = await screen.findByLabelText(/grace period/i)
    await userEvent.clear(input)
    await userEvent.type(input, '15')

    const saveButton = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(saveButton)

    expect(screen.getByText(messages.graceError)).toBeInTheDocument()
    expect(gymApi.updateGracePeriod).not.toHaveBeenCalled()

    await userEvent.clear(input)
    await userEvent.click(saveButton)
    expect(screen.getByText(messages.graceError)).toBeInTheDocument()
  })
})

describe('T-S10-3 / T-US14-2 / T-US14-3 Reminders toggle (Member only)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useOnline).mockReturnValue(true)
    vi.mocked(memberApi.getOwnMembership).mockResolvedValue({
      data: {
        id: 'mem-1',
        reminders_on: true,
      } as never,
      error: null,
    })
    vi.mocked(memberApi.setReminders).mockResolvedValue({ error: null })
  })

  it('T-S10-3 Payment reminders toggle shows only for Member, never for Admin', async () => {
    // Admin view
    const { unmount } = renderSettings('admin')
    expect(screen.queryByLabelText(/payment reminders/i)).not.toBeInTheDocument()
    unmount()

    // Member view
    renderSettings('member')
    await waitFor(() => {
      expect(screen.getByLabelText(/payment reminders/i)).toBeInTheDocument()
    })
  })

  it('T-US14-2 Member switches reminders off -> calls setReminders(false) and shows toast', async () => {
    renderSettings('member')
    const toggle = await screen.findByRole('switch', { name: /payment reminders/i })
    expect(toggle).toBeChecked()

    await userEvent.click(toggle)

    await waitFor(() => {
      expect(memberApi.setReminders).toHaveBeenCalledWith(false)
      expect(screen.getByText(messages.remindersOff)).toBeInTheDocument()
    })

    // Now toggle back on
    await userEvent.click(toggle)
    await waitFor(() => {
      expect(memberApi.setReminders).toHaveBeenCalledWith(true)
      expect(screen.getByText(messages.remindersOn)).toBeInTheDocument()
    })
  })

  it('T-US14-3 Offline disables Payment reminders switch', async () => {
    vi.mocked(useOnline).mockReturnValue(false)
    renderSettings('member')

    const toggle = await screen.findByRole('switch', { name: /payment reminders/i })
    expect(toggle).toBeDisabled()
    expect(screen.getByText(messages.offline)).toBeInTheDocument()
  })
})

