import { Link } from 'react-router-dom'
import { Users, BarChart3, Sparkles, ArrowRight } from 'lucide-react'
import { Card, StatCard } from '../components/ui/Card'
import { getCurrentUser, ROLE_LABELS, type Role } from '../lib/auth'
import { BRANDS, PEOPLE, CREATIVE_ENTRIES } from '../lib/data'

interface QuickLink {
  label: string
  to: string
  description: string
  icon: typeof Users
}

const QUICK_LINKS: Record<string, QuickLink> = {
  founder: {
    label: 'Founder OS',
    to: '/founder',
    description: 'Track team trajectory, run better 1:1s',
    icon: Users,
  },
  am: {
    label: 'AM Tracker',
    to: '/am',
    description: 'Brand health, weekly metrics, notes',
    icon: BarChart3,
  },
  creative: {
    label: 'Creative Bank',
    to: '/creative',
    description: 'Searchable content learnings library',
    icon: Sparkles,
  },
}

const ROLE_ACCESS: Record<Role, string[]> = {
  founder: ['founder', 'am', 'creative'],
  manager: ['founder', 'am', 'creative'],
  am: ['am', 'creative'],
  creator: ['creative'],
}

export default function Dashboard() {
  const user = getCurrentUser()!
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const accessKeys = ROLE_ACCESS[user.role]

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
          Welcome back, {user.name.split(' ')[0]}.
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{today}</p>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Brands" value={BRANDS.length} sub="active accounts" />
        <StatCard label="Team" value={PEOPLE.length} sub="people tracked" />
        <StatCard label="Role" value={ROLE_LABELS[user.role]} sub="current access" />
      </div>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Quick access
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {accessKeys.map((key) => {
            const link = QUICK_LINKS[key]
            const Icon = link.icon
            return (
              <Link to={link.to} key={key} className="block">
                <Card hover>
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-accent/15 p-2.5 text-accent">
                      <Icon size={20} />
                    </div>
                    <ArrowRight size={16} className="text-text-muted" />
                  </div>
                  <div className="mt-4 text-base font-semibold text-text-primary">
                    {link.label}
                  </div>
                  <div className="mt-1 text-xs text-text-secondary">{link.description}</div>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
          This week
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <div className="text-xs uppercase tracking-wider text-text-muted">
              New creative entries
            </div>
            <div className="mt-2 text-2xl font-semibold">{CREATIVE_ENTRIES.length}</div>
            <div className="mt-3 space-y-1">
              {CREATIVE_ENTRIES.slice(0, 3).map((c) => (
                <div key={c.id} className="text-xs text-text-secondary">
                  <span className="text-text-primary">{c.title}</span> — {c.brand}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="text-xs uppercase tracking-wider text-text-muted">Brand snapshot</div>
            <div className="mt-2 text-2xl font-semibold">{BRANDS.length} brands</div>
            <div className="mt-3 space-y-1">
              {BRANDS.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-xs">
                  <span className="text-text-primary">{b.name}</span>
                  <span className="text-text-secondary">{b.amName}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
