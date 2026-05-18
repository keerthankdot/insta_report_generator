import { TrendingUp } from 'lucide-react'
import { Card, StatCard } from '../components/ui/Card'
import { PostCard } from '../components/ui/PostCard'

import { getCurrentUser } from '../lib/auth'
import {
  BRAND_METRICS,
  PEOPLE,
  CREATOR_FORTNIGHT,
  FORTNIGHT_PERIOD,
  FORTNIGHT_BRAND,
  TOP_POSTS_FORTNIGHT,
  formatNumber,
  getBrandsForUser,
} from '../lib/data'

function greet(name: string) {
  const h = new Date().getHours()
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return `${g}, ${name.split(' ')[0]}.`
}

export default function Dashboard() {
  const user = getCurrentUser()!
  const isFounder = user.role === 'founder' || user.role === 'manager'

  // Role-aware brand visibility
  const brands = getBrandsForUser(user.name, user.role)

  // Aggregate totals across visible brands
  let totalReach = 0, totalLikes = 0, totalShares = 0, totalPosts = 0
  brands.forEach((b) => {
    const m = BRAND_METRICS.find((bm) => bm.brandId === b.id)
    const f = FORTNIGHT_BRAND[b.id]
    if (f) totalPosts += f.postsPublished
    m?.platforms.forEach((p) => {
      totalReach += p.primary.value
      p.secondary.forEach((s) => {
        if (['Likes', 'Reactions'].includes(s.label)) totalLikes += s.value
        if (['Shares', 'Reposts'].includes(s.label)) totalShares += s.value
      })
    })
  })

  const avgEng = brands.length
    ? (
        brands.reduce((sum, b) => sum + (FORTNIGHT_BRAND[b.id]?.engagementRate ?? 0), 0) /
        brands.length
      ).toFixed(2)
    : '0.00'

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <p className="mb-1 text-xs text-white/40">{today}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{greet(user.name)}</h1>
        <p className="mt-1 text-sm text-white/50">Week — {FORTNIGHT_PERIOD}</p>
      </header>

      {/* 5 stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Reach" value={formatNumber(totalReach)} sub="this week" />
        <StatCard label="Likes" value={formatNumber(totalLikes)} sub="across platforms" />
        <StatCard label="Shares" value={formatNumber(totalShares)} sub="across platforms" />
        <StatCard label="Posts" value={totalPosts} sub="published" />
        <StatCard label="Brands" value={brands.length} sub="active accounts" />
      </div>

      {/* Avg engagement strip */}
      <div className="mb-10 flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-5 py-3">
        <TrendingUp size={15} className="text-green-400" />
        <span className="text-sm text-white/60">Average engagement rate</span>
        <span className="ml-auto text-sm font-semibold text-white">{avgEng}%</span>
      </div>

      {/* Top performing posts */}
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/35">
        Top performing posts — this week
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOP_POSTS_FORTNIGHT.map((post, i) => (
          <PostCard key={post.id} post={post} rank={i + 1} />
        ))}
      </div>

      {/* Team section — founders only */}
      {isFounder && (
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
