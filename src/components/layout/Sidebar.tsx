import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Users,
  BarChart3,
  Sparkles,
  LogOut,
  ChevronDown,
  UserCircle,
} from 'lucide-react'
import { useState } from 'react'
import { logout, switchRole, type Role, type User, ROLE_LABELS } from '../../lib/auth'

interface NavItem {
  label: string
  to: string
  icon: typeof Home
}

const ALL_ITEMS: Record<string, NavItem> = {
  Home:            { label: 'Dashboard',    to: '/',         icon: Home       },
  'Admin':    { label: 'Admin',   to: '/founder',  icon: Users      },
  'My Brands':     { label: 'My Brands',    to: '/am',       icon: BarChart3  },
  'Creative Bank': { label: 'Creative Bank',to: '/creative', icon: Sparkles   },
  'Profile':       { label: 'Profile',      to: '/profile',  icon: UserCircle },
}

const SIDEBAR_ITEMS: Record<Role, string[]> = {
  admin:   ['Home', 'My Brands', 'Creative Bank', 'Admin', 'Profile'],
  manager: ['Home', 'My Brands', 'Creative Bank', 'Admin', 'Profile'],
  am:      ['Home', 'My Brands', 'Creative Bank', 'Profile'],
  creator: ['Home', 'My Brands', 'Creative Bank', 'Profile'],
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
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
      }}
    >
      {/* Brand + role switcher */}
      <div className="px-4 pb-3 pt-5">
        <div className="mb-3 text-center text-base font-semibold tracking-tight text-white">TNT OS</div>

        {/* Role switcher */}
        <div className="relative">
          <button
            onClick={() => setSwitcherOpen((s) => !s)}
            className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/6 px-3 py-2 text-xs transition-colors hover:bg-white/10"
          >
            <div className="text-left">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-white/35">Viewing as</div>
              <div className="font-medium text-white">{ROLE_LABELS[user.role]}</div>
            </div>
            <ChevronDown size={13} className={`text-white/40 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
          </button>
          {switcherOpen && (
            <div
              className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-white/10 shadow-2xl"
              style={{ background: 'rgba(28,28,30,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
            >
              {(['admin', 'manager', 'am', 'creator'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-xs transition-colors hover:bg-white/5 ${
                    user.role === r ? 'text-white' : 'text-white/50'
                  }`}
                >
                  <span>{ROLE_LABELS[r]}</span>
                  {user.role === r && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                </button>
              ))}
            </div>
          )}
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

      {/* Bottom: sign out */}
      <div className="border-t border-white/[0.07] p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
