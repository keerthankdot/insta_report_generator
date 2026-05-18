import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Users,
  BarChart3,
  Sparkles,
  LogOut,
  ChevronDown,
  Layers,
} from 'lucide-react'
import { useState } from 'react'
import { logout, switchRole, type Role, type User, ROLE_LABELS } from '../../lib/auth'

interface NavItem {
  label: string
  to: string
  icon: typeof Home
}

const ALL_ITEMS: Record<string, NavItem> = {
  Home: { label: 'Dashboard', to: '/', icon: Home },
  'My Brands': { label: 'My Brands', to: '/brands', icon: Layers },
  'Founder OS': { label: 'Founder OS', to: '/founder', icon: Users },
  'AM Tracker': { label: 'AM Tracker', to: '/am', icon: BarChart3 },
  'Creative Bank': { label: 'Creative Bank', to: '/creative', icon: Sparkles },
}

const SIDEBAR_ITEMS: Record<Role, string[]> = {
  founder: ['Home', 'My Brands', 'Founder OS', 'AM Tracker', 'Creative Bank'],
  manager: ['Home', 'My Brands', 'Founder OS', 'AM Tracker', 'Creative Bank'],
  am: ['Home', 'My Brands', 'AM Tracker', 'Creative Bank'],
  creator: ['Home', 'My Brands', 'Creative Bank'],
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
    <aside
      className="fixed left-3 top-3 bottom-3 z-50 flex w-[220px] flex-col overflow-hidden rounded-2xl"
      style={{
        background: 'rgba(28, 28, 30, 0.72)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
      }}
    >
      {/* Brand */}
      <div className="px-5 pb-3 pt-6">
        <div className="text-base font-semibold tracking-tight text-white">
          TNT OS
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
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white/15 text-white shadow-sm backdrop-blur-md border border-white/20'
                        : 'text-white/50 hover:bg-white/8 hover:text-white/80'
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
      <div className="border-t border-white/[0.07] p-3">
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
            <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-lg border border-white/10 shadow-xl" style={{background:'rgba(30,30,32,0.92)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)'}}>
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
