import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { PlatformBadge } from '../../components/ui/Badge'
import { getBrandsForUser } from '../../lib/data'
import { getCurrentUser } from '../../lib/auth'

const STATUS_DOT: Record<string, string> = {
  active: 'bg-emerald-500',
  paused: 'bg-gray-500',
  attention: 'bg-amber-500',
}

export default function AMDashboard() {
  const user = getCurrentUser()!
  const brands = getBrandsForUser(user.name, user.role)

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
          AM Tracker
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Brand health, weekly metrics and AM notes in one place.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {brands.map((b) => (
          <Link key={b.id} to={`/am/${b.id}`}>
            <Card hover>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-base font-semibold text-white"
                    style={{ backgroundColor: b.color }}
                  >
                    {b.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-text-primary">
                        {b.name}
                      </span>
                      <span
                        className={`h-2 w-2 rounded-full ${STATUS_DOT[b.status]}`}
                        title={b.status}
                      />
                    </div>
                    <div className="mt-0.5 text-xs text-text-secondary">
                      AM · {b.amName}
                    </div>
                  </div>
                </div>
                <ArrowRight size={16} className="mt-1 text-text-muted" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {b.platforms.map((p) => (
                  <PlatformBadge key={p} platform={p} />
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
