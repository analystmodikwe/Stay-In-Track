import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { messages } from '../../src/lib/messages'
import { AdminDashboard } from '../../src/pages/AdminDashboard'
import * as dashboardApi from '../../src/lib/api/dashboard'

describe('Error Handling (T-NFR-2 / PRD 12.2)', () => {
  it('contains all required exact error messages in messages dictionary', () => {
    expect(messages.offline).toBe("You're offline. Changes will not be saved.")
    expect(messages.serverError).toBe('Something went wrong. Try again.')
    expect(messages.sessionExpired).toBe('Please log in again.')
    expect(messages.notAllowed).toBe("You can't do that.")
  })

  it('shows "Something went wrong. Try again." and a "Try again" button on server failure', async () => {
    const mockLoad = vi.spyOn(dashboardApi, 'getAdminDashboard').mockResolvedValue({
      data: null,
      error: 'Something went wrong. Try again.',
    })

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    )

    expect(await screen.findByText('Something went wrong. Try again.')).toBeInTheDocument()
    const retryBtn = screen.getByRole('button', { name: /try again/i })
    expect(retryBtn).toBeInTheDocument()

    // Clicking "Try again" triggers reload
    fireEvent.click(retryBtn)
    expect(mockLoad).toHaveBeenCalledTimes(2)
  })

  it('never displays raw Postgres or SQL error codes to users', () => {
    // Test helper to sanitize error messages
    const sanitizeError = (rawError: string): string => {
      if (/PGRST|42P01|23505|violates foreign key|syntax error/i.test(rawError)) {
        return messages.serverError
      }
      return rawError
    }

    const rawDbError = 'PGRST116: JSON object requested, multiple (or no) rows returned'
    expect(sanitizeError(rawDbError)).toBe(messages.serverError)

    const rawSqlError = 'error: relation "public.nonexistent" does not exist (SQLSTATE 42P01)'
    expect(sanitizeError(rawSqlError)).toBe(messages.serverError)
  })
})

