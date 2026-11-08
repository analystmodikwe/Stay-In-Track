/**
 * T-C-12  TabBar / SideMenu — component tests
 * Admin: 4 items in order. Member: 2 items.
 * Under 640px → TabBar. 640px and above → SideMenu.
 * Active item is filled in primary colour.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TabBar } from '../../src/components/TabBar'
import { SideMenu } from '../../src/components/SideMenu'

const ADMIN_ITEMS = ['Dashboard', 'Members', 'Plans', 'Settings']
const MEMBER_ITEMS = ['Home', 'Settings']

describe('T-C-12 TabBar', () => {
  it('T-C-12a Admin: renders 4 items in correct order', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <TabBar role="admin" />
      </MemoryRouter>
    )
    const items = screen.getAllByRole('link')
    const labels = items.map(el => el.textContent?.trim())
    ADMIN_ITEMS.forEach(label => expect(labels).toContain(label))
    // Check order
    const adminIndices = ADMIN_ITEMS.map(label => labels.indexOf(label))
    expect(adminIndices).toEqual([...adminIndices].sort((a, b) => a - b))
  })

  it('T-C-12b Member: renders 2 items in correct order', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <TabBar role="member" />
      </MemoryRouter>
    )
    const items = screen.getAllByRole('link')
    const labels = items.map(el => el.textContent?.trim())
    MEMBER_ITEMS.forEach(label => expect(labels).toContain(label))
    expect(items).toHaveLength(2)
  })

  it('T-C-12c Active item has aria-current="page"', () => {
    render(
      <MemoryRouter initialEntries={['/members']}>
        <TabBar role="admin" />
      </MemoryRouter>
    )
    const activeLink = screen.getByRole('link', { name: /members/i })
    expect(activeLink).toHaveAttribute('aria-current', 'page')
  })
})

describe('T-C-12 SideMenu', () => {
  it('T-C-12d Admin: renders 4 items', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <SideMenu role="admin" />
      </MemoryRouter>
    )
    ADMIN_ITEMS.forEach(label =>
      expect(screen.getByRole('link', { name: new RegExp(label, 'i') })).toBeInTheDocument()
    )
  })

  it('T-C-12e Member: renders 2 items', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <SideMenu role="member" />
      </MemoryRouter>
    )
    MEMBER_ITEMS.forEach(label =>
      expect(screen.getByRole('link', { name: new RegExp(label, 'i') })).toBeInTheDocument()
    )
  })
})

