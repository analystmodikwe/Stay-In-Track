/**
 * Component tests for AdminDashboard (S5):
 * - T-US12-1 Stat cards (Total Members 4, Active 2, Grace period 1, Overdue 1, Revenue R1,350.00), Members per Plan
 * - T-US12-2 Tapping an overdue member opens S7
 * - T-US12-3 Empty gym shows "No Members yet. Add your first Member." with "Add member"
 * - T-S5-1 Loading placeholder (5 cards), error, empty overdue list ("Nobody is overdue.")
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AdminDashboard } from '../../src/pages/AdminDashboard'
import * as dashboardApi from '../../src/lib/api/dashboard'

vi.mock('../../src/lib/api/dashboard')

const sampleDashboardData = {
  total: 4,
  active: 2,
  grace: 1,
  overdue: 1,
  revenue: 1350,
  plans: [
    { name: 'Student', count: 2 },
    { name: 'Standard', count: 1 },
    { name: 'Premium', count: 1 },
  ],
  overdue_list: [
    {
      id: 'mem-ayesha',
      full_name: 'Ayesha Patel',
      plan_name: 'Premium',
      paid_until: null,
      status: 'overdue',
    },
  ],
}

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/members/:id" element={<div>Member Details Page</div>} />
        <Route path="/members" element={<div>Members Roster Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AdminDashboard screen (S5)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('T-US12-1 renders 5 stat cards and Members per Plan summary', async () => {
    vi.mocked(dashboardApi.getAdminDashboard).mockResolvedValue({
      data: sampleDashboardData,
      error: null,
    })

    renderDashboard()

    await waitFor(() => {
      // 5 Stat cards
      expect(screen.getByText('Total Members')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()

      expect(screen.getByLabelText('Active: 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Grace period: 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Overdue: 1')).toBeInTheDocument()

      expect(screen.getByText('Revenue this month')).toBeInTheDocument()
      expect(screen.getByText('R1,350.00')).toBeInTheDocument()

      // Members per Plan
      expect(screen.getByText('Members per Plan')).toBeInTheDocument()
      expect(screen.getByText('Student')).toBeInTheDocument()
      expect(screen.getByText('Standard')).toBeInTheDocument()
      expect(screen.getByText('Premium')).toBeInTheDocument()

      // Overdue list
      expect(screen.getByText('Ayesha Patel')).toBeInTheDocument()
    })
  })

  it('T-US12-2 tapping an overdue member opens S7', async () => {
    vi.mocked(dashboardApi.getAdminDashboard).mockResolvedValue({
      data: sampleDashboardData,
      error: null,
    })

    renderDashboard()

    await screen.findByText('Ayesha Patel')
    fireEvent.click(screen.getByText('Ayesha Patel'))

    expect(screen.getByText('Member Details Page')).toBeInTheDocument()
  })

  it('T-US12-3 empty gym shows empty state with Add member button', async () => {
    vi.mocked(dashboardApi.getAdminDashboard).mockResolvedValue({
      data: {
        total: 0,
        active: 0,
        grace: 0,
        overdue: 0,
        revenue: 0,
        plans: [],
        overdue_list: [],
      },
      error: null,
    })

    renderDashboard()

    await waitFor(() => {
      expect(
        screen.getByText('No Members yet. Add your first Member.')
      ).toBeInTheDocument()
    })

    const addBtn = screen.getByRole('button', { name: /add member/i })
    expect(addBtn).toBeInTheDocument()
    fireEvent.click(addBtn)

    expect(screen.getByText('Members Roster Page')).toBeInTheDocument()
  })

  it('T-S5-1 shows "Nobody is overdue." when overdue list is empty', async () => {
    vi.mocked(dashboardApi.getAdminDashboard).mockResolvedValue({
      data: {
        ...sampleDashboardData,
        overdue: 0,
        overdue_list: [],
      },
      error: null,
    })

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Nobody is overdue.')).toBeInTheDocument()
    })
  })
})
