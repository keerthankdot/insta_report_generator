import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Users,
  BarChart3,
  Sparkles,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { logout, switchRole, type Role, type User, ROLE_LABELS } from '../../lib/auth'

interface NavItem {
  label: string
  to: string
  icon: typeof Home
}

const ALL_ITEMS: Record<string, NavItem> = {
  Home: { label: 'Home', to: '/', icon: Home },
  'Founder OS': { label: 'Founder OS', to: '/founder', icon: Users },
  'AM Tracker': { label: 'AM Tracker', to: '/am', icon: BarChart3 },
  'Creative Bank': { label: 'Creative Bank', to: '/creative', icon: Sparkles },
}

const SIDEBAR_ITEMS: Record<Role, string[]> = {
  founder: ['Home', 'Founder OS', 'AM Tracker', 'Creative Bank'],
  manager: ['Home', 'Founder OS', 'AM Tracker', 'Creative Bank'],
  am: ['Home', 'AM Tracker', 'Creative Bank'],
  creator: ['Home', 'Creative Bank'],
}

interface SidebarProps {
  user: User
  onRoleSwitch: (role: Role) => void
}

export function Sidebar({ user, onRoleSwitch }: SidebarProps) {
  const navigate = useNavigate()
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const items = SIDEBAR_ITEMS[user.role].map((label) => ALL_ITEMS[label])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleRoleSwitch = (role: Role) => {
    switchRole(role)
    onRoleSwitch(role)
    setSwitcherOpen(false)
    navigate('/')
  }

  return (
    <aside className="flex h-screen w-[220px] flex-col border-r border-border bg-surface">
      {/* Brand */}
      <div className="px-5 pb-3 pt-6">
        <div className="text-base font-semibold tracking-tight text-text-primary">
          TNT <span className="text-text-secondary">OS</span>
        </div>
        <div className="mt-0.5 text-[10px] uppercase tracking-widest text-text-muted">
          The New Thing
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-2 flex-1 px-3">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-white'
                        : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                    }`
                  }
                >
                  <Icon size={16} strokeWidth={2} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User + role switcher */}
      <div className="border-t border-border p-3">
        <div className="mb-2 px-2">
          <div className="text-sm font-medium text-text-primary">{user.name}</div>
          <div className="text-xs text-text-secondary">{ROLE_LABELS[user.role]}</div>
        </div>

        {/* DEMO role switcher */}
        <div className="relative mb-2">
          <button
            onClick={() => setSwitcherOpen((s) => !s)}
            className="flex w-full items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/15"
          >
            <span className="flex items-center gap-2">
              <span className="rounded-sm bg-amber-500/30 px-1 py-px text-[9px] font-bold uppercase">
                Demo
              </span>
              Switch role
            </span>
            <ChevronDown size={14} className={switcherOpen ? 'rotate-180' : ''} />
          </button>
          {switcherOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-lg border border-border bg-[#222226] shadow-xl">
              {(['founder', 'manager', 'am', 'creator'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-white/5 ${
                    user.role === r ? 'text-accent' : 'text-text-primary'
                  }`}
                >
                  <span>{ROLE_LABELS[r]}</span>
                  {user.role === r && <span className="text-[10px]">active</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
