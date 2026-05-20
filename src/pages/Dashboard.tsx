
import { Card, StatCard } from '../components/ui/Card'
import { PostCard } from '../components/ui/PostCard'
import { getCurrentUser } from '../lib/auth'
import {
  PEOPLE,
  CREATOR_FORTNIGHT,
  TOP_POSTS_FORTNIGHT,
} from '../lib/data'

function greet(name: string) {
  const h = new Date().getHours()
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return `${g}, ${name.split(' ')[0]}.`
}

export default function Dashboard() {
  const user = getCurrentUser()!
  const isAdmin = user.role === 'admin' || user.role === 'manager'

  // Role-aware brand visibility
  // brands unused values hardcoded



  const now = new Date()
  const today = now.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  // ISO week number + range
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)

  // Weeks are Wed–Wed. Find the most recent Wednesday, then viewing = previous Wed cycle.
  const daysSinceWed = (now.getDay() + 4) % 7 // 0 on Wed, 1 on Thu, ..., 6 on Tue
  const thisWed = new Date(now)
  thisWed.setDate(now.getDate() - daysSinceWed)
  const prevWedStart = new Date(thisWed)
  prevWedStart.setDate(thisWed.getDate() - 7)
  const prevWedEnd = new Date(thisWed)
  prevWedEnd.setDate(thisWed.getDate() - 1) // Tue before current Wed
  const fmt = (dt: Date) => `${dt.getDate()} ${dt.toLocaleDateString('en-GB', { month: 'short' })}`
  const weekRange = `${fmt(prevWedStart)} to ${fmt(prevWedEnd)}`

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <p className="mb-1 text-xs text-white/40">{today}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{greet(user.name)}</h1>
        <p className="mt-1 text-sm text-white/50">You are viewing Week {weekNumber - 1} <span className="text-white/30">·</span> {weekRange}</p>
      </header>

      {/* 5 stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Brands" value="6" />
        <StatCard label="Reach" value="10.1L" delta={8.2} />
        <StatCard label="Shares" value="2.5k" delta={-3.4} />
        <StatCard label="Posts" value="54" delta={12.0} />
        <StatCard label="Avg Eng Rate" value="1.65%" delta={-0.3} />
      </div>


      {/* Top performing posts */}
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
        Top performing posts in Week {weekNumber - 1}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOP_POSTS_FORTNIGHT.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Team section admins only */}
      {isAdmin && (
        <>
          <h2 className="mb-4 mt-10 text-xs font-semibold uppercase tracking-wider text-white/35">
            Team this week
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {PEOPLE.map((p) => {
              const cs = CREATOR_FORTNIGHT[p.name]
              return (
                <Card key={p.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">{p.name}</div>
                      <div className="text-xs text-white/40">{p.role}</div>
                    </div>
                    {cs && (
                      <div className="text-right text-xs">
                        <div className="font-semibold text-white">{cs.postsLive} posts</div>
                        <div className="text-white/35">{cs.entriesLogged} entries</div>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

