import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Welcome } from '../../src/pages/Welcome'

describe('T-S1-1 Welcome screen', () => {
  it('shows wordmark, pitch, Create account button and Log in button', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/sign-up" element={<div>Sign Up Page</div>} />
          <Route path="/log-in" element={<div>Log In Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    // Logo wordmark
    expect(screen.getByLabelText('STAY IN TRACK')).toHaveTextContent('STAY IN TRACK')

    // Pitch text
    expect(screen.getByText('Know who has paid. Every time.')).toBeInTheDocument()

    // Create account -> S2
    const createBtn = screen.getByRole('button', { name: 'Create account' })
    expect(createBtn).toBeInTheDocument()
    await userEvent.click(createBtn)
    expect(screen.getByText('Sign Up Page')).toBeInTheDocument()
  })

  it('Log in button navigates to /log-in', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/log-in" element={<div>Log In Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    const loginBtn = screen.getByRole('button', { name: 'Log in' })
    expect(loginBtn).toBeInTheDocument()
    await userEvent.click(loginBtn)
    expect(screen.getByText('Log In Page')).toBeInTheDocument()
  })
})

