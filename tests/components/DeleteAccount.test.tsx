/**
 * T-US4-1, T-US4-2, T-US4-3  Delete Account (M4) — component tests
 * T-SEC-19a / 19b              Integration tests in deleteAccount.int.test.ts
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { DeleteAccount } from '../../src/modals/DeleteAccount'

vi.mock('../../src/lib/api/auth', () => ({
  deleteAccount: vi.fn(),
}))

// Admin variant
const ADMIN_TEXT = 'This will permanently delete your account, gym, all Plans, Members and Payments.'
// Member variant
const MEMBER_TEXT = 'This will delete your login. Your gym keeps your Member record and payment history.'

describe('DeleteAccount modal (M4)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('T-US4-1a Admin variant shows the correct warning text', () => {
    render(
      <MemoryRouter>
        <DeleteAccount role="admin" isOpen onClose={vi.fn()} onDeleted={vi.fn()} />
      </MemoryRouter>
    )
    expect(screen.getByText(ADMIN_TEXT)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('T-US4-2a Member variant shows the correct warning text', () => {
    render(
      <MemoryRouter>
        <DeleteAccount role="member" isOpen onClose={vi.fn()} onDeleted={vi.fn()} />
      </MemoryRouter>
    )
    expect(screen.getByText(MEMBER_TEXT)).toBeInTheDocument()
  })

  it('T-US4-1b Admin: "Delete" button calls deleteAccount and triggers onDeleted', async () => {
    const { deleteAccount } = await import('../../src/lib/api/auth')
    vi.mocked(deleteAccount).mockResolvedValueOnce({ error: null })
    const onDeleted = vi.fn()

    render(
      <MemoryRouter>
        <DeleteAccount role="admin" isOpen onClose={vi.fn()} onDeleted={onDeleted} />
      </MemoryRouter>
    )
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))

    await waitFor(() => expect(onDeleted).toHaveBeenCalledOnce())
  })

  it('T-US4-2b Member: "Delete" button calls deleteAccount and triggers onDeleted', async () => {
    const { deleteAccount } = await import('../../src/lib/api/auth')
    vi.mocked(deleteAccount).mockResolvedValueOnce({ error: null })
    const onDeleted = vi.fn()

    render(
      <MemoryRouter>
        <DeleteAccount role="member" isOpen onClose={vi.fn()} onDeleted={onDeleted} />
      </MemoryRouter>
    )
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))

    await waitFor(() => expect(onDeleted).toHaveBeenCalledOnce())
  })

  it('T-US4-3 Offline: "Delete" is disabled and offline banner is visible', () => {
    render(
      <MemoryRouter>
        <DeleteAccount role="admin" isOpen onClose={vi.fn()} onDeleted={vi.fn()} isOffline />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeDisabled()
    expect(screen.getByText("You're offline. Changes will not be saved.")).toBeInTheDocument()
  })

  it('Cancel button calls onClose', async () => {
    const onClose = vi.fn()
    render(
      <MemoryRouter>
        <DeleteAccount role="admin" isOpen onClose={onClose} onDeleted={vi.fn()} />
      </MemoryRouter>
    )
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})

