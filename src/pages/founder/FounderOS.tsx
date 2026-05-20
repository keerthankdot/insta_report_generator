import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { TrajectoryBadge } from '../../components/ui/Badge'
import { PEOPLE, type Trajectory } from '../../lib/data'

const SORT_ORDER: Trajectory[] = ['Needs Attention', 'Rising', 'Steady', 'New']

export default function AdminOS() {
  const [sortBy, setSortBy] = useState<'trajectory' | 'name'>('trajectory')
  const [query, setQuery] = useState('')

  const sorted = useMemo(() => {
    const filtered = PEOPLE.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()),
    )
    if (sortBy === 'name') {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    }
    return [...filtered].sort(
      (a, b) =>
        SORT_ORDER.indexOf(a.trajectory) - SORT_ORDER.indexOf(b.trajectory),
    )
  }, [sortBy, query])

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
          Admin
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Your team at a glance. Click anyone to see their trajectory and 1:1 prep.
        </p>
      </header>

      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people..."
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'trajectory' | 'name')}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
        >
          <option value="trajectory">Sort: Trajectory</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((person) => (
          <Link key={person.id} to={`/admin/${person.id}`}>
            <Card hover>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                    {person.avatarInitials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">
                      {person.name}
                    </div>
                    <div className="text-xs text-text-secondary">{person.role}</div>
                  </div>
                </div>
                <ArrowRight size={14} className="mt-1 text-text-muted" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-text-muted">{person.team}</span>
                <TrajectoryBadge trajectory={person.trajectory} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
