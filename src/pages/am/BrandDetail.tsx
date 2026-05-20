import { useMemo, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Award, ChevronUp, ChevronDown } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts'
import { Card, CardHeader, StatCard } from '../../components/ui/Card'
import { PlatformBadge } from '../../components/ui/Badge'
import { HealthBadge } from '../../components/ui/HealthBadge'
import {
  getBrandById, getWeeklyData, getAMNotesForBrand, getBrandPosts,
  getContentTypeStats, getBrandHealth, getWeekRangeStats,
  WEEKS, MONTHLY_PERIOD_LABEL, MONTHLY_WEEK_IDXS, PREV_MONTH_WEEK_IDXS,
  PULSE_WEEK_IDX, PULSE_PERIOD,
  formatNumber, formatDate,
  type ContentTypeStat,
} from '../../lib/data'

const IG_COLOR = '#e1306c'
const X_COLOR  = '#aaaaaa'
type Tab = 'overview' | 'pulse' | 'monthly'

function fmtOrDash(v: number | null | undefined, pct?: boolean): string {
  if (v === null || v === undefined) return '—'
  if (pct) return `${v.toFixed(2)}%`
  return formatNumber(v)
}

function Delta({ cur, prev, pct = false }: { cur: number; prev: number; pct?: boolean }) {
  const diff = cur - prev
  const rel  = prev !== 0 ? ((diff / prev) * 100) : 0
  const up   = diff >= 0
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-medium ${up ? 'text-emerald-400' : 'text-red-400'}`}>
      {up ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      {pct ? `${Math.abs(diff).toFixed(2)}pp` : `${Math.abs(rel).toFixed(1)}%`}
    </span>
  )
}

export default function BrandDetail() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState<Tab>('overview')

  const brand   = id ? getBrandById(id) : undefined
  const weekly  = id ? getWeeklyData(id) : undefined
  const amNotes = id ? getAMNotesForBrand(id) : []
  const posts   = id ? getBrandPosts(id) : []
  const ctStats = id ? getContentTypeStats(id) : []
  const health  = id ? getBrandHealth(id) : { signal: 'amber' as const, reason: '' }

  const monthlyStats = id ? getWeekRangeStats(id, MONTHLY_WEEK_IDXS) : null
  const prevStats    = id ? getWeekRangeStats(id, PREV_MONTH_WEEK_IDXS) : null
  const pulseStats   = id ? getWeekRangeStats(id, [PULSE_WEEK_IDX]) : null
  const priorPulse   = id ? getWeekRangeStats(id, [PULSE_WEEK_IDX - 1]) : null

  // Trend chart data
  const trendData = useMemo(() => {
    if (!weekly) return []
    return WEEKS.map((week, i) => {
      const ig = weekly.instagram[i]
      const x  = weekly.x?.[i]
      const row: Record<string, string | number | null> = { week }
      row['IG Reach'] = ig?.reach ?? null
      if (weekly.x) row['X Imp'] = x?.impressions ?? null
      return row
    })
  }, [weekly])

  // Monthly trend (April weeks only)
  const monthlyTrendData = useMemo(() => {
    if (!weekly) return []
    return MONTHLY_WEEK_IDXS.map((i) => {
      const ig = weekly.instagram[i]
      return { week: WEEKS[i], reach: ig?.reach ?? null, er: ig?.engagementRate ?? null }
    })
  }, [weekly])

  // Peak week
  const peakWeekIdx = useMemo(() => {
    if (!weekly) return -1
    let peak = 0, idx = -1
    weekly.instagram.forEach((w, i) => {
      if (w?.reach && w.reach > peak) { peak = w.reach; idx = i }
    })
    return idx
  }, [weekly])

  const summary = useMemo(() => {
    if (!weekly) return { avgReach: 0, avgEng: 0, totalShares: 0, peakReach: 0, peakWeek: '' }
    const ig = weekly.instagram
    const reaches = ig.map((w) => w?.reach).filter((r): r is number => r !== null && r !== undefined)
    const ers     = ig.map((w) => w?.engagementRate).filter((r): r is number => r !== null && r !== undefined)
    const shares  = ig.map((w) => w?.shares).filter((r): r is number => r !== null && r !== undefined)
    const peakReach = Math.max(0, ...reaches)
    const peakIdx   = ig.findIndex((w) => w?.reach === peakReach)
    return {
      avgReach:   reaches.length ? reaches.reduce((s, v) => s + v, 0) / reaches.length : 0,
      avgEng:     ers.length ? ers.reduce((s, v) => s + v, 0) / ers.length : 0,
      totalShares: shares.reduce((s, v) => s + v, 0),
      peakReach,
      peakWeek: peakIdx >= 0 ? WEEKS[peakIdx] : '',
    }
  }, [weekly])

  if (!brand || !weekly) return <Navigate to="/am" replace />

  const hasX = !!weekly.x
  const usesDelta = weekly.instagram.some((w) => w?.followersDelta !== undefined)

  // Top 5 and bottom 3 IG posts
  const igPosts    = posts.filter((p) => p.platform === 'Instagram').sort((a, b) => b.er - a.er)
  const top5       = igPosts.slice(0, 5)
  const bottom3    = igPosts.slice(-3).reverse()

  // Pulse top/bottom
  const pulseTop    = igPosts[0]
  const pulseBottom = igPosts[igPosts.length - 1]

  const CT_COLORS: Record<string, string> = {
    Reel: '#e1306c', Carousel: '#8b5cf6', Static: '#0ea5e9', Tweet: '#38bdf8',
  }

  return (
    <div>
      <Link to="/am" className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white">
        <ArrowLeft size={14} /> Back to brands
      </Link>

      {/* Header */}
      <header className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl text-xl font-semibold text-white" style={{ backgroundColor: brand.color }}>
            {brand.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">{brand.name}</h1>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-sm text-white/50">AM · {brand.amName}</span>
              <HealthBadge signal={health.signal} reason={health.reason} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">{brand.platforms.map((p) => <PlatformBadge key={p} platform={p} />)}</div>
      </header>

      {/* Tabs */}
      <div className="mb-8 flex gap-1 rounded-xl border border-white/8 bg-white/4 p-1 w-fit">
        {(['overview', 'pulse', 'monthly'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
              tab === t
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t === 'overview' ? 'Overview' : t === 'pulse' ? `Weekly Pulse` : 'Monthly Report'}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <>
          <section className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">10-week summary — Instagram</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard label="Avg Reach"   value={formatNumber(Math.round(summary.avgReach))} sub={`Total ${formatNumber(summary.avgReach * 8)}`} />
              <StatCard label="Avg ER"      value={`${summary.avgEng.toFixed(2)}%`}            sub="across reported weeks" />
              <StatCard label="Total Shares" value={formatNumber(summary.totalShares)}          sub="all weeks" />
              <StatCard label="Peak Week"   value={formatNumber(summary.peakReach)}             sub={summary.peakWeek || 'n/a'} />
            </div>
          </section>

          <section className="mb-8">
            <Card>
              <CardHeader title="Reach trend" subtitle={hasX ? '10 weeks · IG reach vs X impressions' : '10 weeks · IG reach'} />
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickFormatter={(v) => formatNumber(v)} />
                    <Tooltip contentStyle={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} formatter={(v: number | string) => typeof v === 'number' ? formatNumber(v) : v} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="IG Reach" stroke={IG_COLOR} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    {hasX && <Line type="monotone" dataKey="X Imp" stroke={X_COLOR} strokeWidth={2} dot={{ r: 3 }} connectNulls />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">Weekly breakdown</h2>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40">
                      <th className="px-2 py-2 font-medium">Week</th>
                      <th className="px-2 py-2 font-medium">IG Reach</th>
                      <th className="px-2 py-2 font-medium">IG ER</th>
                      <th className="px-2 py-2 font-medium">IG Shares</th>
                      <th className="px-2 py-2 font-medium">Followers {usesDelta ? '(Δ)' : ''}</th>
                      {hasX && <><th className="px-2 py-2 font-medium">X Imp</th><th className="px-2 py-2 font-medium">X ER</th><th className="px-2 py-2 font-medium">X Reposts</th></>}
                    </tr>
                  </thead>
                  <tbody>
                    {WEEKS.map((week, i) => {
                      const ig = weekly.instagram[i]
                      const x  = weekly.x?.[i]
                      const isPeak = i === peakWeekIdx
                      return (
                        <tr key={week} className={`border-b border-white/5 hover:bg-white/[0.02] ${isPeak ? 'bg-emerald-500/5' : ''}`}>
                          <td className="px-2 py-2.5 font-medium text-white">
                            <div className="flex items-center gap-1.5">{week}{isPeak && <Award size={11} className="text-emerald-400" />}</div>
                          </td>
                          <td className="px-2 py-2.5 text-white/80">{fmtOrDash(ig?.reach)}</td>
                          <td className="px-2 py-2.5 text-white/80">{fmtOrDash(ig?.engagementRate, true)}</td>
                          <td className="px-2 py-2.5 text-white/80">{fmtOrDash(ig?.shares)}</td>
                          <td className="px-2 py-2.5 text-white/80">{usesDelta ? fmtOrDash(ig?.followersDelta) : fmtOrDash(ig?.followersTotal)}</td>
                          {hasX && <><td className="px-2 py-2.5 text-white/80">{fmtOrDash(x?.impressions)}</td><td className="px-2 py-2.5 text-white/80">{fmtOrDash(x?.engagementRate, true)}</td><td className="px-2 py-2.5 text-white/80">{fmtOrDash(x?.reposts)}</td></>}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          <AMNotes notes={amNotes} />
        </>
      )}

      {/* ── WEEKLY PULSE TAB ── */}
      {tab === 'pulse' && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40">Content window</p>
              <p className="text-sm font-medium text-white">{PULSE_PERIOD}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40">Report generated</p>
              <p className="text-sm font-medium text-white">May 20, 2026</p>
            </div>
          </div>

          {/* Headline numbers */}
          {pulseStats && pulseStats.weeksWithData > 0 ? (
            <section className="mb-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">This week at a glance</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Reach', cur: pulseStats.avgReach, prev: priorPulse?.avgReach ?? 0, fmt: formatNumber },
                  { label: 'Avg ER', cur: pulseStats.avgEr, prev: priorPulse?.avgEr ?? 0, fmt: (v: number) => `${v.toFixed(2)}%` },
                  { label: 'Shares', cur: pulseStats.totalShares, prev: priorPulse?.totalShares ?? 0, fmt: formatNumber },
                ].map(({ label, cur, prev, fmt }) => (
                  <Card key={label}>
                    <div className="text-xs text-white/40 mb-1">{label}</div>
                    <div className="text-2xl font-bold text-white">{fmt(cur)}</div>
                    {prev > 0 && <Delta cur={cur} prev={prev} />}
                  </Card>
                ))}
              </div>
            </section>
          ) : (
            <Card><p className="text-sm text-white/40">No IG data for this week — check back next week.</p></Card>
          )}

          {/* Top post */}
          {pulseTop && (
            <section className="mb-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">Top post</h2>
              <PostRow post={pulseTop} rank={1} highlight />
            </section>
          )}

          {/* Bottom post flag */}
          {pulseBottom && pulseBottom.id !== pulseTop?.id && (
            <section className="mb-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">Lowest performer — flag</h2>
              <PostRow post={pulseBottom} rank={igPosts.length} />
            </section>
          )}

          {/* AM fields */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">AM insight layer</h2>
            <Card>
              <div className="space-y-4">
                <AMTextField label="Context on top post" placeholder="Why did this post perform the way it did? Cultural timing, format, hook?" />
                <AMTextField label="Flag for client" placeholder="Anything that needs client attention this week?" />
                <AMTextField label="Publishing next week" placeholder="What's going live next week?" />
              </div>
              <div className="mt-4 flex justify-end">
                <button className="rounded-xl border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium text-white hover:bg-white/12">Save pulse</button>
              </div>
            </Card>
          </section>
        </>
      )}

      {/* ── MONTHLY REPORT TAB ── */}
      {tab === 'monthly' && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40">Report period</p>
              <p className="text-sm font-medium text-white">{MONTHLY_PERIOD_LABEL}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40">Generated</p>
              <p className="text-sm font-medium text-white">May 20, 2026</p>
            </div>
          </div>

          {/* Month at a glance scorecard */}
          {monthlyStats && (
            <section className="mb-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">Month at a glance</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <ScoreCard
                  label="Total Reach"
                  value={formatNumber(monthlyStats.totalReach)}
                  cur={monthlyStats.avgReach}
                  prev={prevStats?.avgReach ?? 0}
                />
                <ScoreCard
                  label="Avg ER"
                  value={`${monthlyStats.avgEr.toFixed(2)}%`}
                  cur={monthlyStats.avgEr}
                  prev={prevStats?.avgEr ?? 0}
                  pct
                />
                <ScoreCard
                  label="Total Shares"
                  value={formatNumber(monthlyStats.totalShares)}
                  cur={monthlyStats.totalShares}
                  prev={prevStats?.totalShares ?? 0}
                />
                <ScoreCard
                  label="Followers"
                  value={monthlyStats.latestFollowers ? formatNumber(monthlyStats.latestFollowers) : '—'}
                  cur={monthlyStats.latestFollowers ?? 0}
                  prev={monthlyStats.firstFollowers ?? 0}
                />
              </div>
              {hasX && monthlyStats.xTotalImpressions > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-2">
                  <ScoreCard label="X Impressions" value={formatNumber(monthlyStats.xTotalImpressions)} cur={monthlyStats.xTotalImpressions} prev={prevStats?.xTotalImpressions ?? 0} />
                  <ScoreCard label="X Avg ER" value={`${monthlyStats.xAvgEr.toFixed(2)}%`} cur={monthlyStats.xAvgEr} prev={prevStats?.xAvgEr ?? 0} pct />
                </div>
              )}
            </section>
          )}

          {/* Weekly reach trend */}
          <section className="mb-8">
            <Card>
              <CardHeader title="Week-over-week reach" subtitle={`${MONTHLY_PERIOD_LABEL} — Instagram`} />
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickFormatter={(v) => formatNumber(v)} />
                    <Tooltip contentStyle={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} formatter={(v: number | string) => typeof v === 'number' ? formatNumber(v) : v} />
                    <Line type="monotone" dataKey="reach" stroke={IG_COLOR} strokeWidth={2} dot={{ r: 4 }} connectNulls name="IG Reach" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>

          {/* Content type performance */}
          {ctStats.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">Content type performance — April</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader title="Avg ER by content type" subtitle="higher = better" />
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ctStats} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={10} tickFormatter={(v) => `${v}%`} />
                        <YAxis type="category" dataKey="contentType" stroke="rgba(255,255,255,0.3)" fontSize={11} width={58} />
                        <Tooltip contentStyle={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} formatter={(v: number | string) => [`${v}%`, 'Avg ER']} />
                        <Bar dataKey="avgEr" radius={[0, 4, 4, 0]}>
                          {ctStats.map((s: ContentTypeStat) => <Cell key={s.contentType} fill={CT_COLORS[s.contentType] ?? '#666'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/8 text-white/35">
                        <th className="pb-2 text-left font-medium">Type</th>
                        <th className="pb-2 text-right font-medium">Posts</th>
                        <th className="pb-2 text-right font-medium">Avg ER</th>
                        <th className="pb-2 text-right font-medium">Best ER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ctStats.map((s: ContentTypeStat) => (
                        <tr key={s.contentType} className="border-b border-white/5">
                          <td className="py-2">
                            <span className="font-medium text-white">{s.contentType}</span>
                            <p className="text-white/35 truncate max-w-[140px]">{s.bestPostTitle}</p>
                          </td>
                          <td className="py-2 text-right text-white/70">{s.postCount}</td>
                          <td className="py-2 text-right text-white/70">{s.avgEr.toFixed(2)}%</td>
                          <td className="py-2 text-right font-semibold text-white">{s.bestPostEr.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            </section>
          )}

          {/* Top 5 posts */}
          {top5.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">Top 5 posts — by ER</h2>
              <div className="space-y-2">
                {top5.map((p, i) => <PostRow key={p.id} post={p} rank={i + 1} />)}
              </div>
            </section>
          )}

          {/* Bottom 3 — internal */}
          {bottom3.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">Bottom 3 — internal only</h2>
              <div className="space-y-2">
                {bottom3.map((p, i) => <PostRow key={p.id} post={p} rank={igPosts.length - i} dim />)}
              </div>
            </section>
          )}

          {/* AM insight layer */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">AM insight layer</h2>
            <Card>
              <div className="space-y-5">
                <AMTextField label="Executive summary" placeholder="What did this month look like in plain language? The one thing that worked and one thing to address." rows={3} />
                <AMTextField label="Insights and recommendations" placeholder="2-3 specific actions for next month. Format: data point → reason → action." rows={4} />
                <AMTextField label="Next month focus" placeholder="What will we test, retire, or double down on next month?" />
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                <p className="text-xs text-white/30">Internal — not client-facing until exported</p>
                <button className="rounded-xl border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium text-white hover:bg-white/12">Save report</button>
              </div>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}

// ── Sub-components ──

function PostRow({ post, rank, highlight, dim }: {
  post: ReturnType<typeof getBrandPosts>[number]
  rank: number
  highlight?: boolean
  dim?: boolean
}) {
  return (
    <div className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
      highlight ? 'border-white/15 bg-white/6' : 'border-white/6 bg-white/3'
    } ${dim ? 'opacity-60' : ''}`}>
      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/15 text-[10px] font-semibold text-white/40">
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            post.contentType === 'Reel'     ? 'bg-pink-500/15 text-pink-300' :
            post.contentType === 'Carousel' ? 'bg-purple-500/15 text-purple-300' :
            post.contentType === 'Static'   ? 'bg-blue-500/15 text-blue-300' :
                                              'bg-sky-500/15 text-sky-300'
          }`}>{post.contentType}</span>
          <span className="text-xs text-white/30">{post.date}</span>
        </div>
        <p className="mt-0.5 text-xs font-medium text-white line-clamp-1">{post.title}</p>
        {post.reel14dEr && (
          <p className="text-[10px] text-white/35 mt-0.5">14-day ER: {post.reel14dEr.toFixed(2)}% {post.reel30dEr ? `· 30-day: ${post.reel30dEr.toFixed(2)}%` : ''}</p>
        )}
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-sm font-bold text-white">{post.er.toFixed(2)}%</div>
        <div className="text-[10px] text-white/35">ER</div>
        {post.reach && <div className="text-[10px] text-white/35">{formatNumber(post.reach)} reach</div>}
        {post.impressions && <div className="text-[10px] text-white/35">{formatNumber(post.impressions)} imp</div>}
      </div>
    </div>
  )
}

function ScoreCard({ label, value, cur, prev, pct }: { label: string; value: string; cur: number; prev: number; pct?: boolean }) {
  return (
    <Card>
      <div className="text-xs text-white/40 mb-1">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      {prev > 0 && <Delta cur={cur} prev={prev} pct={pct} />}
    </Card>
  )
}

function AMTextField({ label, placeholder, rows = 2 }: { label: string; placeholder: string; rows?: number }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white/40">{label}</label>
      <textarea
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none rounded-lg border border-white/8 bg-white/4 px-3 py-2.5 text-xs text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none"
      />
    </div>
  )
}

function AMNotes({ notes }: { notes: ReturnType<typeof getAMNotesForBrand> }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp size={13} className="text-white/40" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/35">AM notes</h2>
      </div>
      <div className="space-y-3">
        {notes.length === 0 && (
          <Card><p className="text-sm text-white/40">No notes yet.</p></Card>
        )}
        {notes.map((n) => (
          <Card key={n.id}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-white">{n.author}</span>
              <span className="text-xs text-white/40">{formatDate(n.date)}</span>
            </div>
            <p className="text-sm leading-relaxed text-white/80">{n.content}</p>
          </Card>
        ))}
        <Card>
          <textarea rows={2} placeholder="Add an AM note..." className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none" />
          <div className="mt-2 flex justify-end">
            <button className="rounded-lg border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/12">Save note</button>
          </div>
        </Card>
      </div>
    </section>
  )
}
