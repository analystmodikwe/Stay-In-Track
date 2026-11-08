/**
 * T-US2-1, T-US2-2, T-US2-4  Log In — component tests
 * T-US2-3, T-US2-5           handled in ForgotPassword.test.tsx
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LogIn } from '../../src/pages/LogIn'

vi.mock('../../src/lib/api/auth', () => ({
  logIn:       vi.fn(),
  resendEmail: vi.fn(),
}))

import * as authApi from '../../src/lib/api/auth'

function renderLogIn(initialEntries = ['/log-in']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <LogIn />
    </MemoryRouter>
  )
}

function getPasswordInput() {
  return screen.getByLabelText(/^password$/i, { selector: 'input' })
}

describe('LogIn screen', () => {
  beforeEach(() => vi.clearAllMocks())

  it('T-US2-1a renders email, password and login button', () => {
    renderLogIn()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(getPasswordInput()).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
  })

  it('T-US2-2 unverified email → shows verify banner + Resend email link', async () => {
    vi.mocked(authApi.logIn).mockResolvedValueOnce({
      error: { message: 'Email not confirmed', code: 'email_not_confirmed' },
      data: { session: null, user: null },
    })

    renderLogIn()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(getPasswordInput(), 'Password1')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() =>
      expect(screen.getByText('Please verify your email first.')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: /resend email/i })).toBeInTheDocument()
  })

  it('T-US2-4 wrong password → shows incorrect message', async () => {
    vi.mocked(authApi.logIn).mockResolvedValueOnce({
      error: { message: 'Invalid login credentials', code: 'invalid_credentials' },
      data: { session: null, user: null },
    })

    renderLogIn()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(getPasswordInput(), 'WrongPass1')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() =>
      expect(screen.getByText('Email or password is incorrect.')).toBeInTheDocument()
    )
  })

  it('T-US2-4 rate limit hit → shows too-many-attempts and disables button', async () => {
    vi.mocked(authApi.logIn).mockResolvedValueOnce({
      error: { message: 'over_request_rate_limit', code: 'over_request_rate_limit' },
      data: { session: null, user: null },
    })

    renderLogIn()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(getPasswordInput(), 'WrongPass1')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() =>
      expect(screen.getByText('Too many attempts. Try again in 15 minutes.')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: /log in/i })).toBeDisabled()
  })

  it('T-US2-1b shows verify-email banner when navigated here after sign-up', () => {
    // Simulate navigation with state from SignUp
    render(
      <MemoryRouter initialEntries={[{ pathname: '/log-in', state: { verifyEmail: true } }]}>
        <LogIn />
      </MemoryRouter>
    )
    expect(
      screen.getByText('Check your email and tap the link to verify your account.')
    ).toBeInTheDocument()
  })
})
