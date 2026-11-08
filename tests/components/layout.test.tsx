import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TabBar } from '../../src/components/TabBar'
import { SideMenu } from '../../src/components/SideMenu'
import { AdminDashboard } from '../../src/pages/AdminDashboard'
import { tokens } from '../../src/theme/tokens'

describe('Responsive Layout Breakpoints (T-NFR-8 / PRD 9.3)', () => {
  it('defines correct breakpoint and layout tokens', () => {
    expect(tokens.breakpoint.tablet).toBe('640px')
    expect(tokens.breakpoint.desktop).toBe('1024px')
    expect(tokens.layout.sideMenuWidth).toBe('240px')
    expect(tokens.layout.maxContent).toBe('1200px')
    expect(tokens.layout.modalWidth).toBe('480px')
  })

  it('hides TabBar on tablet and desktop screens (>=640px)', () => {
    const { container } = render(
      <MemoryRouter>
        <TabBar role="admin" />
      </MemoryRouter>
    )
    const nav = container.querySelector('nav')
    expect(nav?.className).toContain('tablet:hidden')
  })

  it('hides SideMenu on mobile (<640px) and shows with 240px width on tablet and desktop', () => {
    const { container } = render(
      <MemoryRouter>
        <SideMenu role="admin" />
      </MemoryRouter>
    )
    const aside = container.querySelector('aside')
    expect(aside?.className).toContain('hidden')
    expect(aside?.className).toContain('tablet:flex')
    expect(aside?.className).toMatch(/w-\[240px\]/)
  })

  it('adapts AdminDashboard grid columns across phone (2-col), tablet (3-col), desktop (5-col)', () => {
    const { container } = render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    )
    const main = container.querySelector('main')
    expect(main?.className).toContain('max-w-content')

    // Find grid elements
    const grids = container.querySelectorAll('.grid')
    expect(grids.length).toBeGreaterThan(0)
    grids.forEach(grid => {
      expect(grid.className).toMatch(/grid-cols-2\s+tablet:grid-cols-3\s+desktop:grid-cols-5/)
    })
  })
})
