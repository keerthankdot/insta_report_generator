import { useMemo } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Award } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardHeader, StatCard } from '../../components/ui/Card'
import { PlatformBadge } from '../../components/ui/Badge'
import {
  getBrandById,
  getWeeklyData,
  getAMNotesForBrand,
  WEEKS,
  formatNumber,
  formatDate,
} from '../../lib/data'

const IG_COLOR = '#e1306c'
const X_COLOR = '#ffffff'

function fmtOrDash(v: number | null | undefined, opts?: { percent?: boolean; signed?: boolean }): string {
  if (v === null || v === undefined) return '—'
  if (opts?.percent) return `${v.toFixed(2)}%`
  if (opts?.signed) {
    if (v === 0) return '0'
    return v > 0 ? `+${formatNumber(v)}` : `-${formatNumber(Math.abs(v))}`
  }
  return formatNumber(v)
}

export default function BrandDetail() {
  const { id } = useParams<{ id: string }>()
  const brand = id ? getBrandById(id) : undefined
  const weekly = id ? getWeeklyData(id) : undefined
  const amNotes = id ? getAMNotesForBrand(id) : []

  // Trend data (must be called before any early return)
  const trendData = useMemo(() => {
    if (!weekly) return []
    return WEEKS.map((week, i) => {
      const ig = weekly.instagram[i]
      const x = weekly.x?.[i]
      const row: Record<string, string | number | null> = { week }
      row['IG Reach'] = ig?.reach ?? null
      if (weekly.x) row['X Impressions'] = x?.impressions ?? null
      return row
    })
  }, [weekly])

  // Summary stats (must be called before any early return)
  const summary = useMemo(() => {
    if (!weekly) {
      return { avgReach: 0, totalReach: 0, avgEng: 0, totalShares: 0, peakReach: 0, peakWeek: '' }
    }
    const igWeeks = weekly.instagram
    const reachVals = igWeeks
      .map((w) => w?.reach)
      .filter((r): r is number => r !== null && r !== undefined)
    const engVals = igWeeks
      .map((w) => w?.engagementRate)
      .filter((r): r is number => r !== null && r !== undefined)
    const shareVals = igWeeks
      .map((w) => w?.shares)
      .filter((r): r is number => r !== null && r !== undefined)

    const totalReach = reachVals.reduce((s, v) => s + v, 0)
    const avgReach = reachVals.length ? totalReach / reachVals.length : 0
    const avgEng = engVals.length ? engVals.reduce((s, v) => s + v, 0) / engVals.length : 0
    const totalShares = shareVals.reduce((s, v) => s + v, 0)

    let peakReach = 0
    let peakIdx = -1
    igWeeks.forEach((w, i) => {
      if (w?.reach && w.reach > peakReach) {
        peakReach = w.reach
        peakIdx = i
      }
    })

    return {
      avgReach,
      totalReach,
      avgEng,
      totalShares,
      peakReach,
      peakWeek: peakIdx >= 0 ? WEEKS[peakIdx] : '',
    }
  }, [weekly])

  const peakWeekIdx = useMemo(() => {
    if (!weekly) return -1
    let peak = 0
    let idx = -1
    weekly.instagram.forEach((w, i) => {
      if (w?.reach && w.reach > peak) {
        peak = w.reach
        idx = i
      }
    })
    return idx
  }, [weekly])

  if (!brand || !weekly) return <Navigate to="/am" replace />

  const hasX = !!weekly.x

  // Decide follower display mode: delta or total
  const usesDelta = weekly.instagram.some((w) => w?.followersDelta !== undefined)

  return (
    <div>
      <Link
        to="/am"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white"
      >
        <ArrowLeft size={14} />
        Back to brands
      </Link>

      {/* Header */}
      <header className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-xl font-semibold text-white"
            style={{ backgroundColor: brand.color }}
          >
            {brand.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {brand.name}
            </h1>
            <div className="mt-1 text-sm text-white/50">
              AM · {brand.amName} · 10-week tracker (Mar 11 — May 13)
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {brand.platforms.map((p) => (
            <PlatformBadge key={p} platform={p} />
          ))}
        </div>
      </header>

      {/* Summary cards */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">
          Instagram — 10 week summary
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Avg Reach"
            value={formatNumber(Math.round(summary.avgReach))}
            sub={`Total ${formatNumber(summary.totalReach)}`}
          />
          <StatCard
            label="Avg Eng Rate"
            value={`${summary.avgEng.toFixed(2)}%`}
            sub="across reported weeks"
          />
          <StatCard
            label="Total Shares"
            value={formatNumber(summary.totalShares)}
            sub="all weeks combined"
          />
          <StatCard
            label="Peak Week"
            value={formatNumber(summary.peakReach)}
            sub={summary.peakWeek ? `${summary.peakWeek} reach` : 'no peak'}
          />
        </div>
      </section>

      {/* Trend chart */}
      <section className="mb-8">
        <Card>
          <CardHeader
            title="Reach trend"
            subtitle={hasX ? '10 weeks · IG reach vs X impressions' : '10 weeks · IG reach'}
          />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={11}
                  tickFormatter={(v) => formatNumber(v)}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1c1c1e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number | string) =>
                    typeof v === 'number' ? formatNumber(v) : v
                  }
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="IG Reach"
                  stroke={IG_COLOR}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
                {hasX && (
                  <Line
                    type="monotone"
                    dataKey="X Impressions"
                    stroke={X_COLOR}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* Weekly breakdown table */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">
          Weekly breakdown
        </h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40">
                  <th className="px-2 py-2 font-medium">Week</th>
                  <th className="px-2 py-2 font-medium">IG Reach</th>
                  <th className="px-2 py-2 font-medium">IG Eng</th>
                  <th className="px-2 py-2 font-medium">IG Shares</th>
                  <th className="px-2 py-2 font-medium">
                    IG Followers {usesDelta ? '(Δ)' : ''}
                  </th>
                  {hasX && (
                    <>
                      <th className="px-2 py-2 font-medium">X Imp</th>
                      <th className="px-2 py-2 font-medium">X Eng</th>
                      <th className="px-2 py-2 font-medium">X Reposts</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {WEEKS.map((week, i) => {
                  const ig = weekly.instagram[i]
                  const x = weekly.x?.[i]
                  const isPeak = i === peakWeekIdx
                  return (
                    <tr
                      key={week}
                      className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${
                        isPeak ? 'bg-emerald-500/5' : ''
                      }`}
                    >
                      <td className="px-2 py-2.5 font-medium text-white">
                        <div className="flex items-center gap-1.5">
                          {week}
                          {isPeak && (
                            <Award size={12} className="text-emerald-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-white/80">
                        {fmtOrDash(ig?.reach)}
                      </td>
                      <td className="px-2 py-2.5 text-white/80">
                        {fmtOrDash(ig?.engagementRate, { percent: true })}
                      </td>
                      <td className="px-2 py-2.5 text-white/80">
                        {fmtOrDash(ig?.shares)}
                      </td>
                      <td className="px-2 py-2.5 text-white/80">
                        {usesDelta
                          ? fmtOrDash(ig?.followersDelta, { signed: true })
                          : fmtOrDash(ig?.followersTotal)}
                      </td>
                      {hasX && (
                        <>
                          <td className="px-2 py-2.5 text-white/80">
                            {fmtOrDash(x?.impressions)}
                          </td>
                          <td className="px-2 py-2.5 text-white/80">
                            {fmtOrDash(x?.engagementRate, { percent: true })}
                          </td>
                          <td className="px-2 py-2.5 text-white/80">
                            {fmtOrDash(x?.reposts)}
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* AM Notes */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp size={14} className="text-white/40" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/35">
            AM notes
          </h2>
        </div>
        <div className="space-y-3">
          {amNotes.length === 0 && (
            <Card>
              <p className="text-sm text-white/40">No notes yet for this brand.</p>
            </Card>
          )}
          {amNotes.map((n) => (
            <Card key={n.id}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-white">{n.author}</span>
                <span className="text-xs text-white/40">{formatDate(n.date)}</span>
              </div>
              <p className="text-sm leading-relaxed text-white/90">{n.content}</p>
            </Card>
          ))}
          <Card>
            <textarea
              rows={2}
              placeholder="Add an AM note..."
              className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
            <div className="mt-2 flex justify-end">
              <button className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover">
                Save note
              </button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
