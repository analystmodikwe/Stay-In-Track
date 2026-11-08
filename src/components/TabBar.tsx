/**
 * TabBar — shown under 640px. Active item filled in primary colour.
 * Admin: Dashboard, Members, Plans, Settings.
 * Member: Home, Settings.
 * T-C-12.
 */
import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CreditCard, Settings, Home } from 'lucide-react'

export type UserRole = 'admin' | 'member'

export interface TabBarProps {
  role: UserRole
}

const adminTabs = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Members',   icon: Users,           to: '/members'   },
  { label: 'Plans',     icon: CreditCard,      to: '/plans'     },
  { label: 'Settings',  icon: Settings,        to: '/settings'  },
] as const

const memberTabs = [
  { label: 'Home',     icon: Home,     to: '/home'     },
  { label: 'Settings', icon: Settings, to: '/settings' },
] as const

export function TabBar({ role }: TabBarProps) {
  const tabs = role === 'admin' ? adminTabs : memberTabs

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-40 tablet:hidden"
    >
      <ul className="flex">
        {tabs.map(tab => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end
              className={({ isActive }) => [
                'flex flex-col items-center justify-center gap-0.5',
                'min-h-[56px] w-full',
                'text-[11px] font-medium transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
                isActive
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-primary',
              ].join(' ')}
            >
              {({ isActive }) => (
                <>
                  <tab.icon
                    size={22}
                    aria-hidden="true"
                    fill={isActive ? 'currentColor' : 'none'}
                  />
                  {tab.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

