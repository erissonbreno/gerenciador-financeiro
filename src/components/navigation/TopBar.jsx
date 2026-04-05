import { NavLink } from 'react-router-dom'

const links = [
  { to: '/patients', label: 'Pacientes' },
  { to: '/financial', label: 'Financeiro' },
]

export function TopBar() {
  return (
    <header className="bg-white border-b border-gray-200 md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold text-primary-700">Financeiro</h1>
        <nav className="flex gap-4">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-primary-700' : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
