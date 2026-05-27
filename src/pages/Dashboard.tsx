
import { useState, useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { Card, StatCard } from '../components/ui/Card'
import { PostCard } from '../components/ui/PostCard'
import { getCurrentUser } from '../lib/auth'
import {
  PEOPLE,
  CREATOR_FORTNIGHT,
  TOP_POSTS_FORTNIGHT,
  BRAND_POSTS,
  WEEKS,
  formatNumber,
} from '../lib/data'

const WEEK_BASE_MS = new Date(2026, 2, 11).getTime()

function weekIdxForDate(dateStr: string): number {
  return Math.floor((new Date(dateStr).getTime() - WEEK_BASE_MS) / (7 * 86400000))
}

function greet(name: string) {
  const h = new Date().getHours()
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return `${g}, ${name.split(' ')[0]}.`
}

export default function Dashboard() {
  const user = getCurrentUser()!
  const isAdmin = user.role === 'admin' || user.role === 'manager'

  const [fromIdx, setFromIdx] = useState(0)
  const [toIdx, setToIdx] = useState(WEEKS.length - 1)

  const rangeLabel = fromIdx === toIdx
    ? WEEKS[fromIdx]
    : `${WEEKS[fromIdx]} – ${WEEKS[toIdx]}`

  // All brand posts flattened
  const allPosts = useMemo(() => Object.values(BRAND_POSTS).flat(), [])

  // Filter posts by selected week range
  const filteredPosts = useMemo(() =>
    allPosts.filter((p) => {
      const idx = weekIdxForDate(p.date)
      return idx >= fromIdx && idx <= toIdx
    }),
    [allPosts, fromIdx, toIdx]
  )

  // Aggregate stats from filtered posts
  const stats = useMemo(() => {
    const igPosts = filteredPosts.filter(p => p.platform === 'Instagram')
    const totalReach = igPosts.reduce((s, p) => s + (p.reach ?? 0), 0)
    const totalShares = filteredPosts.reduce((s, p) => s + (p.shares ?? 0), 0)
    const postCount = filteredPosts.length
    const avgEr = igPosts.length > 0
      ? igPosts.reduce((s, p) => s + (p.er ?? 0), 0) / igPosts.length
      : 0
    return { totalReach, totalShares, postCount, avgEr }
  }, [filteredPosts])

  // Filter top posts by range
  const filteredTopPosts = useMemo(() =>
    TOP_POSTS_FORTNIGHT.filter((p) => {
      const idx = weekIdxForDate(p.date)
      return idx >= fromIdx && idx <= toIdx
    }),
    [fromIdx, toIdx]
  )

  return (
    <div>
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-white">{greet(user.name)}</h1>
      </header>

      {/* Date range filter */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3">
        <TrendingUp size={13} className="flex-shrink-0 text-white/40" />
        <span className="text-xs text-white/40">Showing</span>
        <select
          value={fromIdx}
          onChange={(e) => {
            const v = Number(e.target.value)
            setFromIdx(v)
            if (v > toIdx) setToIdx(v)
          }}
          className="rounded-lg border border-white/8 bg-[#1c1c1e] px-2.5 py-1.5 text-xs font-medium text-white focus:outline-none"
        >
          {WEEKS.map((w, i) => (
            <option key={w} value={i} className="bg-[#1c1c1e]">{w}</option>
          ))}
        </select>
        <span className="text-xs text-white/30">to</span>
        <select
          value={toIdx}
          onChange={(e) => {
            const v = Number(e.target.value)
            setToIdx(v)
            if (v < fromIdx) setFromIdx(v)
          }}
          className="rounded-lg border border-white/8 bg-[#1c1c1e] px-2.5 py-1.5 text-xs font-medium text-white focus:outline-none"
        >
          {WEEKS.map((w, i) => (
            <option key={w} value={i} className="bg-[#1c1c1e]">{w}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-white/30">
          {toIdx - fromIdx + 1} week{toIdx - fromIdx + 1 !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Posts" value={String(stats.postCount)} />
        <StatCard label="Reach" value={formatNumber(stats.totalReach)} />
        <StatCard label="Shares" value={formatNumber(stats.totalShares)} />
        <StatCard label="Avg Eng Rate" value={`${stats.avgEr.toFixed(2)}%`} />
      </div>

      {/* Top performing posts */}
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
        Top performing posts · {rangeLabel}
      </h2>
      {filteredTopPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTopPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/30">No top posts for this range.</p>
      )}

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
