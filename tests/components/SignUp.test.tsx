/**
 * T-US1-1, T-US1-2, T-US1-3  Sign Up (Admin form) — component tests
 * T-US2-1, T-US2-2, T-US2-4  Log In — component tests (via same import)
 * Note: Integration tests for US1 / US2 are in auth.int.test.ts (Phase 3 Step 4).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { SignUp } from '../../src/pages/SignUp'
import { LogIn } from '../../src/pages/LogIn'

// Mock the auth API so no real network calls happen
vi.mock('../../src/lib/api/auth', () => ({
  signUp: vi.fn(),
  logIn: vi.fn(),
  resendEmail: vi.fn(),
}))

function renderWithRoutes(initialEntry = '/sign-up') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/log-in" element={<LogIn />} />
        <Route path="/privacy" element={<div>Privacy Notice Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

function getPasswordInput() {
  return screen.getByLabelText(/^password$/i, { selector: 'input' })
}

describe('SignUp — Admin form', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('T-US1-1 shows the sign-up form with all Admin fields', () => {
    renderWithRoutes()
    expect(screen.getByLabelText(/account type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/gym name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(getPasswordInput()).toBeInTheDocument()
    expect(screen.getByLabelText(/i am 18 or older/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/i agree to the privacy notice/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('T-US1-3a "Sign up" is disabled when checkboxes are unticked', () => {
    renderWithRoutes()
    const btn = screen.getByRole('button', { name: /sign up/i })
    expect(btn).toBeDisabled()
  })

  it('T-US1-3b "Sign up" is disabled when password is too short', async () => {
    renderWithRoutes()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(/i am 18 or older/i))
    await user.click(screen.getByLabelText(/i agree to the privacy notice/i))
    await user.type(getPasswordInput(), 'abc1')
    const btn = screen.getByRole('button', { name: /sign up/i })
    expect(btn).toBeDisabled()
  })

  it('T-US1-3c "Sign up" is disabled when password has no number', async () => {
    renderWithRoutes()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(/i am 18 or older/i))
    await user.click(screen.getByLabelText(/i agree to the privacy notice/i))
    await user.type(getPasswordInput(), 'abcdefgh')
    expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled()
  })

  it('T-US1-3d shows password error on blur when password is invalid', async () => {
    renderWithRoutes()
    const user = userEvent.setup()
    const passwordField = getPasswordInput()
    await user.type(passwordField, 'tooshort')
    await user.tab()
    expect(await screen.findByText('At least 8 characters, including a number.')).toBeInTheDocument()
  })

  it('T-US1-3e "Sign up" becomes enabled when form is fully valid', async () => {
    renderWithRoutes()
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText(/account type/i), 'admin')
    await user.type(screen.getByLabelText(/gym name/i), 'Iron Haven Gym')
    await user.type(screen.getByLabelText(/full name/i), 'Sipho Dlamini')
    await user.type(screen.getByLabelText(/email/i), 'sipho@example.com')
    await user.type(getPasswordInput(), 'Password1')
    await user.click(screen.getByLabelText(/i am 18 or older/i))
    await user.click(screen.getByLabelText(/i agree to the privacy notice/i))
    expect(screen.getByRole('button', { name: /sign up/i })).not.toBeDisabled()
  })

  it('T-US1-1 on success → navigates to S3 with verify-email banner', async () => {
    const { signUp } = await import('../../src/lib/api/auth')
    vi.mocked(signUp).mockResolvedValueOnce({ error: null })

    renderWithRoutes()
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText(/account type/i), 'admin')
    await user.type(screen.getByLabelText(/gym name/i), 'Iron Haven Gym')
    await user.type(screen.getByLabelText(/full name/i), 'Sipho Dlamini')
    await user.type(screen.getByLabelText(/email/i), 'sipho@example.com')
    await user.type(getPasswordInput(), 'Password1')
    await user.click(screen.getByLabelText(/i am 18 or older/i))
    await user.click(screen.getByLabelText(/i agree to the privacy notice/i))
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() =>
      expect(screen.getByText('Check your email and tap the link to verify your account.')).toBeInTheDocument()
    )
  })

  it('T-US1-2 on duplicate email → shows "already has an account" message', async () => {
    const { signUp } = await import('../../src/lib/api/auth')
    vi.mocked(signUp).mockResolvedValueOnce({
      error: { message: 'User already registered', code: 'user_already_exists' },
    })

    renderWithRoutes()
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText(/account type/i), 'admin')
    await user.type(screen.getByLabelText(/gym name/i), 'Iron Haven Gym')
    await user.type(screen.getByLabelText(/full name/i), 'Sipho Dlamini')
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
    await user.type(getPasswordInput(), 'Password1')
    await user.click(screen.getByLabelText(/i am 18 or older/i))
    await user.click(screen.getByLabelText(/i agree to the privacy notice/i))
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() =>
      expect(screen.getByText(/this email already has an account/i)).toBeInTheDocument()
    )
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
  })

  it('T-US1-1 Gym name field is hidden when account type is Member', async () => {
    renderWithRoutes()
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText(/account type/i), 'member')
    expect(screen.queryByLabelText(/gym name/i)).not.toBeInTheDocument()
  })
})
