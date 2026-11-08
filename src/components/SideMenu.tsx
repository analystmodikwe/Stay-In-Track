/**
 * SideMenu — shown from 640px. Active item filled in primary colour.
 * Admin: Dashboard, Members, Plans, Settings.
 * Member: Home, Settings.
 * T-C-12.
 */
import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CreditCard, Settings, Home } from 'lucide-react'
import type { UserRole } from './TabBar'

export interface SideMenuProps {
  role: UserRole
}

const adminItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Members',   icon: Users,           to: '/members'   },
  { label: 'Plans',     icon: CreditCard,      to: '/plans'     },
  { label: 'Settings',  icon: Settings,        to: '/settings'  },
] as const

const memberItems = [
  { label: 'Home',     icon: Home,     to: '/home'     },
  { label: 'Settings', icon: Settings, to: '/settings' },
] as const

export function SideMenu({ role }: SideMenuProps) {
  const items = role === 'admin' ? adminItems : memberItems

  return (
    <aside
      aria-label="Main navigation"
      className="hidden tablet:flex flex-col w-[240px] min-h-screen bg-white border-r border-border fixed left-0 top-0 z-40"
    >
      {/* App name */}
      <div className="px-4 py-5 border-b border-border">
        <span className="text-heading font-bold text-primary">STAY IN TRACK</span>
      </div>

      <nav className="flex-1 py-2">
        <ul className="flex flex-col gap-1 px-2">
          {items.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end
                className={({ isActive }) => [
                  'flex items-center gap-3 px-3 py-2.5 rounded-button',
                  'text-body font-medium transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-background hover:text-primary',
                ].join(' ')}
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={20}
                      aria-hidden="true"
                      fill={isActive ? 'currentColor' : 'none'}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

