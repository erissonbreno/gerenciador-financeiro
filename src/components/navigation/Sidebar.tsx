import React from 'react'
import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: React.FC
}

const links: NavItem[] = [
  { to: '/patients', label: 'Pacientes', icon: UsersIcon },
  { to: '/financial', label: 'Financeiro', icon: WalletIcon },
]

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )
}

export function Sidebar() {
  return (
    <aside className="bg-white border-r border-gray-200 w-64 md:w-20 lg:w-64 flex-shrink-0 min-h-screen">
      <div className="p-4 lg:p-6">
        <h1 className="text-xl font-bold text-primary-700 hidden lg:block">Financeiro</h1>
        <h1 className="text-xl font-bold text-primary-700 lg:hidden text-center">F</h1>
      </div>
      <nav className="mt-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 lg:px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon />
            <span className="hidden lg:inline">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
