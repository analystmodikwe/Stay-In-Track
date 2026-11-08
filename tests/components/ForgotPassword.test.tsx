/**
 * T-US2-3  Forgot Password — "If an account exists…" message (always shown)
 * T-US2-5  "Set new password" mode (opened from reset link)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ForgotPassword } from '../../src/pages/ForgotPassword'

vi.mock('../../src/lib/api/auth', () => ({
  sendPasswordReset: vi.fn(),
  updatePassword:    vi.fn(),
}))

import * as authApi from '../../src/lib/api/auth'

describe('ForgotPassword screen', () => {
  beforeEach(() => vi.clearAllMocks())

  it('T-US2-3a shows the email input and "Send link" button', () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    )
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send link/i })).toBeInTheDocument()
  })

  it('T-US2-3b always shows the neutral message regardless of whether email exists', async () => {
    vi.mocked(authApi.sendPasswordReset).mockResolvedValueOnce({ error: null })

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'anyone@example.com')
    await user.click(screen.getByRole('button', { name: /send link/i }))

    await waitFor(() =>
      expect(
        screen.getByText("If an account exists for this email, we've sent a reset link.")
      ).toBeInTheDocument()
    )
  })

  it('T-US2-3c shows same message even for unknown email (never reveals account existence)', async () => {
    vi.mocked(authApi.sendPasswordReset).mockResolvedValueOnce({ error: null })

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'nobody@example.com')
    await user.click(screen.getByRole('button', { name: /send link/i }))

    await waitFor(() =>
      expect(
        screen.getByText("If an account exists for this email, we've sent a reset link.")
      ).toBeInTheDocument()
    )
  })

  it('T-US2-5a shows "Set new password" mode when hash fragment has access_token', () => {
    // Simulate the reset link opening with the token in the URL hash
    render(
      <MemoryRouter initialEntries={['/?type=recovery#access_token=fake-token']}>
        <ForgotPassword mode="reset" />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /set new password/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save password/i })).toBeInTheDocument()
  })

  it('T-US2-5b saving a valid new password → navigates to S3 with "Password updated" banner', async () => {
    vi.mocked(authApi.updatePassword).mockResolvedValueOnce({ error: null })

    render(
      <MemoryRouter initialEntries={['/?type=recovery#access_token=fake-token']}>
        <ForgotPassword mode="reset" />
      </MemoryRouter>
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/new password/i), 'NewPassword1')
    await user.click(screen.getByRole('button', { name: /save password/i }))

    await waitFor(() =>
      expect(screen.getByText('Password updated. Please log in.')).toBeInTheDocument()
    )
  })

  it('T-US2-5c "Save password" disabled when new password is invalid', async () => {
    render(
      <MemoryRouter initialEntries={['/?type=recovery#access_token=fake-token']}>
        <ForgotPassword mode="reset" />
      </MemoryRouter>
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/new password/i), 'tooshort')
    expect(screen.getByRole('button', { name: /save password/i })).toBeDisabled()
  })
})

