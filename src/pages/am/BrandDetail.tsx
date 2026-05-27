import { useMemo, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Award, ChevronUp, ChevronDown, Download, TrendingUp } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Card, CardHeader } from '../../components/ui/Card'
import { PlatformBadge } from '../../components/ui/Badge'
import { HealthBadge } from '../../components/ui/HealthBadge'
import {
  getBrandById, getWeeklyData, getBrandPosts,
  getBrandHealth, getWeekRangeStats,
  WEEKS,
  formatNumber,
  type ContentType,
  type BrandPost,
} from '../../lib/data'
import { generatePptx } from '../../lib/generatePptx'

const IG_COLOR = '#e1306c'
const X_COLOR  = '#aaaaaa'

// Mar 11 2026 is WEEKS[0]
const WEEK_BASE_MS = new Date(2026, 2, 11).getTime()

function weekIdxForDate(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - WEEK_BASE_MS
  return Math.floor(diff / (7 * 86400000))
}

function fmtOrDash(v: number | null | undefined, pct?: boolean): string {
  if (v === null || v === undefined) return '-'
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

const CT_COLORS: Record<string, string> = {
  Reel: '#e1306c', Carousel: '#8b5cf6', Static: '#0ea5e9', Tweet: '#38bdf8',
}

function ctBadge(ct: ContentType) {
  const cls =
    ct === 'Reel'     ? 'bg-pink-500/15 text-pink-300' :
    ct === 'Carousel' ? 'bg-purple-500/15 text-purple-300' :
    ct === 'Static'   ? 'bg-blue-500/15 text-blue-300' :
                        'bg-sky-500/15 text-sky-300'
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cls}`}>{ct}</span>
}

function PostRow({ post, rank, highlight, dim }: {
  post: BrandPost; rank: number; highlight?: boolean; dim?: boolean
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
          {ctBadge(post.contentType)}
          <span className="text-xs text-white/30">{post.date}</span>
        </div>
        <p className="mt-0.5 text-xs font-medium text-white line-clamp-1">{post.title}</p>
        {post.reel14dEr && (
          <p className="text-[10px] text-white/35 mt-0.5">
            14-day ER: {post.reel14dEr.toFixed(2)}%
            {post.reel30dEr ? ` · 30-day: ${post.reel30dEr.toFixed(2)}%` : ''}
          </p>
        )}
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-sm font-bold text-white">{post.er.toFixed(2)}%</div>
        <div className="text-[10px] text-white/35">ER</div>
        {post.reach     && <div className="text-[10px] text-white/35">{formatNumber(post.reach)} reach</div>}
        {post.impressions && <div className="text-[10px] text-white/35">{formatNumber(post.impressions)} imp</div>}
      </div>
    </div>
  )
}

export default function BrandDetail() {
  const { id } = useParams<{ id: string }>()

  const brand  = id ? getBrandById(id) : undefined
  const weekly = id ? getWeeklyData(id) : undefined
  const posts  = id ? getBrandPosts(id) : []
  const health = id ? getBrandHealth(id) : { signal: 'amber' as const, reason: '' }

  const [fromIdx, setFromIdx] = useState(0)
  const [toIdx,   setToIdx]   = useState(WEEKS.length - 1)

  const filteredIdxs = useMemo(
    () => Array.from({ length: toIdx - fromIdx + 1 }, (_, k) => fromIdx + k),
    [fromIdx, toIdx],
  )

  const rangeStats = id ? getWeekRangeStats(id, filteredIdxs) : null
  const priorIdxs  = useMemo(() => {
    const span = toIdx - fromIdx + 1
    const prevFrom = Math.max(0, fromIdx - span)
    const prevTo   = fromIdx - 1
    if (prevTo < prevFrom) return []
    return Array.from({ length: prevTo - prevFrom + 1 }, (_, k) => prevFrom + k)
  }, [fromIdx, toIdx])
  const priorStats = id && priorIdxs.length ? getWeekRangeStats(id, priorIdxs) : null

  const trendData = useMemo(() => {
    if (!weekly) return []
    return filteredIdxs.map((i) => {
      const ig = weekly.instagram[i]
      const x  = weekly.x?.[i]
      const row: Record<string, string | number | null> = { week: WEEKS[i] }
      row['IG Reach'] = ig?.reach ?? null
      if (weekly.x) row['X Imp'] = x?.impressions ?? null
      return row
    })
  }, [weekly, filteredIdxs])

  const peakWeekIdx = useMemo(() => {
    if (!weekly) return -1
    let peak = 0, idx = -1
    filteredIdxs.forEach((i) => {
      const r = weekly.instagram[i]?.reach
      if (r && r > peak) { peak = r; idx = i }
    })
    return idx
  }, [weekly, filteredIdxs])

  const filteredPosts = useMemo(
    () => posts.filter((p) => {
      const wi = weekIdxForDate(p.date)
      return wi >= fromIdx && wi <= toIdx
    }),
    [posts, fromIdx, toIdx],
  )

  const igPosts  = useMemo(() => filteredPosts.filter((p) => p.platform === 'Instagram').sort((a, b) => b.er - a.er), [filteredPosts])
  const top5     = igPosts.slice(0, 5)
  const bottom3  = igPosts.slice(-3).reverse()

  const ctStats = useMemo(() => {
    const map: Record<string, { ers: number[]; best: BrandPost | null }> = {}
    igPosts.forEach((p) => {
      if (!map[p.contentType]) map[p.contentType] = { ers: [], best: null }
      map[p.contentType].ers.push(p.er)
      if (!map[p.contentType].best || p.er > map[p.contentType].best!.er) map[p.contentType].best = p
    })
    return Object.entries(map).map(([ct, { ers, best }]) => ({
      contentType: ct as ContentType,
      postCount: ers.length,
      avgEr: ers.reduce((s, v) => s + v, 0) / ers.length,
      bestPostTitle: best?.title ?? '',
      bestPostEr: best?.er ?? 0,
    })).sort((a, b) => b.avgEr - a.avgEr)
  }, [igPosts])

  const hasX        = !!weekly?.x
  const usesDelta   = !!weekly?.instagram.some((w) => w?.followersDelta !== undefined)

  const rangeLabel  = `${WEEKS[fromIdx]} to ${WEEKS[toIdx]}`

  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!brand || !weekly || !rangeStats) return
    setDownloading(true)
    try {
      const weeklyRows = filteredIdxs.map((i) => ({
        weekLabel: WEEKS[i],
        igReach:   weekly.instagram[i]?.reach   ?? null,
        igEr:      weekly.instagram[i]?.engagementRate ?? null,
        igShares:  weekly.instagram[i]?.shares  ?? null,
        followers: usesDelta
          ? (weekly.instagram[i]?.followersDelta ?? null)
          : (weekly.instagram[i]?.followersTotal ?? null),
        xImp: weekly.x?.[i]?.impressions    ?? null,
        xEr:  weekly.x?.[i]?.engagementRate ?? null,
      }))
      const trendValues = filteredIdxs.map((i) => ({
        week:  WEEKS[i],
        reach: weekly.instagram[i]?.reach ?? null,
      }))
      await generatePptx({
        brand,
        rangeLabel,
        rangeStats,
        priorStats,
        weeklyRows,
        trendValues,
        igPosts,
        ctStats,
        hasX,
      })
    } finally {
      setDownloading(false)
    }
  }

  if (!brand || !weekly) return <Navigate to="/am" replace />

  return (
    <div>

      <Link to="/am" className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white no-print">
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
        <div className="flex items-center gap-3">
          <div className="flex gap-2 no-print">{brand.platforms.map((p) => <PlatformBadge key={p} platform={p} />)}</div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-xs font-medium text-white hover:bg-white/12 transition-colors disabled:opacity-50"
          >
            <Download size={13} />
            {downloading ? 'Building...' : 'Download report'}
          </button>
        </div>
      </header>

      {/* Date range filter */}
      <div className="no-print mb-8 flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3">
        <TrendingUp size={13} className="text-white/40 flex-shrink-0" />
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
          {WEEKS.map((w, i) => <option key={w} value={i} className="bg-[#1c1c1e]">{w}</option>)}
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
          {WEEKS.map((w, i) => <option key={w} value={i} className="bg-[#1c1c1e]">{w}</option>)}
        </select>
        <span className="ml-auto text-xs text-white/30">{filteredIdxs.length} week{filteredIdxs.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Stats strip */}
      {rangeStats && rangeStats.weeksWithData > 0 ? (
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">{rangeLabel}, Instagram</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <ScoreCard
              label="Avg Reach"
              value={formatNumber(Math.round(rangeStats.avgReach))}
              cur={rangeStats.avgReach}
              prev={priorStats?.avgReach ?? 0}
            />
            <ScoreCard
              label="Avg ER"
              value={`${rangeStats.avgEr.toFixed(2)}%`}
              cur={rangeStats.avgEr}
              prev={priorStats?.avgEr ?? 0}
              pct
            />
            <ScoreCard
              label="Total Shares"
              value={formatNumber(rangeStats.totalShares)}
              cur={rangeStats.totalShares}
              prev={priorStats?.totalShares ?? 0}
            />
            <ScoreCard
              label="Total Reach"
              value={formatNumber(rangeStats.totalReach)}
              cur={rangeStats.totalReach}
              prev={priorStats?.totalReach ?? 0}
            />
          </div>
          {hasX && rangeStats.xTotalImpressions > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <ScoreCard label="X Impressions" value={formatNumber(rangeStats.xTotalImpressions)} cur={rangeStats.xTotalImpressions} prev={priorStats?.xTotalImpressions ?? 0} />
              <ScoreCard label="X Avg ER" value={`${rangeStats.xAvgEr.toFixed(2)}%`} cur={rangeStats.xAvgEr} prev={priorStats?.xAvgEr ?? 0} pct />
            </div>
          )}
        </section>
      ) : (
        <section className="mb-8">
          <Card><p className="text-sm text-white/40">No data for this range.</p></Card>
        </section>
      )}

      {/* Reach trend chart */}
      <section className="mb-8">
        <Card>
          <CardHeader
            title="Reach trend"
            subtitle={`${rangeLabel} · ${hasX ? 'IG reach vs X impressions' : 'IG reach'}`}
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickFormatter={(v) => formatNumber(v)} />
                <Tooltip
                  contentStyle={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number | string) => typeof v === 'number' ? formatNumber(v) : v}
                />
                <Line type="monotone" dataKey="IG Reach" stroke={IG_COLOR} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                {hasX && <Line type="monotone" dataKey="X Imp" stroke={X_COLOR} strokeWidth={2} dot={{ r: 3 }} connectNulls />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* Weekly breakdown table */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">Weekly breakdown</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/40">
                  <th className="px-2 py-2 font-medium">Week</th>
                  <th className="px-2 py-2 font-medium">IG Reach</th>
                  <th className="px-2 py-2 font-medium">IG ER</th>
                  <th className="px-2 py-2 font-medium">IG Shares</th>
                  <th className="px-2 py-2 font-medium">Followers{usesDelta ? ' (delta)' : ''}</th>
                  {hasX && <><th className="px-2 py-2 font-medium">X Imp</th><th className="px-2 py-2 font-medium">X ER</th></>}
                </tr>
              </thead>
              <tbody>
                {filteredIdxs.map((i) => {
                  const ig  = weekly.instagram[i]
                  const x   = weekly.x?.[i]
                  const isPeak = i === peakWeekIdx
                  return (
                    <tr key={WEEKS[i]} className={`border-b border-white/5 hover:bg-white/[0.02] ${isPeak ? 'bg-emerald-500/5' : ''}`}>
                      <td className="px-2 py-2.5 font-medium text-white">
                        <div className="flex items-center gap-1.5">
                          {WEEKS[i]}
                          {isPeak && <Award size={11} className="text-emerald-400" />}
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-white/80">{fmtOrDash(ig?.reach)}</td>
                      <td className="px-2 py-2.5 text-white/80">{fmtOrDash(ig?.engagementRate, true)}</td>
                      <td className="px-2 py-2.5 text-white/80">{fmtOrDash(ig?.shares)}</td>
                      <td className="px-2 py-2.5 text-white/80">{usesDelta ? fmtOrDash(ig?.followersDelta) : fmtOrDash(ig?.followersTotal)}</td>
                      {hasX && <><td className="px-2 py-2.5 text-white/80">{fmtOrDash(x?.impressions)}</td><td className="px-2 py-2.5 text-white/80">{fmtOrDash(x?.engagementRate, true)}</td></>}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Content type performance */}
      {ctStats.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">Content type performance</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader title="Avg ER by content type" subtitle="higher = better" />
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ctStats} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={10} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="contentType" stroke="rgba(255,255,255,0.3)" fontSize={11} width={58} />
                    <Tooltip
                      contentStyle={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number | string) => [`${v}%`, 'Avg ER']}
                    />
                    <Bar dataKey="avgEr" radius={[0, 4, 4, 0]}>
                      {ctStats.map((s) => <Cell key={s.contentType} fill={CT_COLORS[s.contentType] ?? '#666'} />)}
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
                  {ctStats.map((s) => (
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
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">Top posts by ER</h2>
          <div className="space-y-2">
            {top5.map((p, i) => <PostRow key={p.id} post={p} rank={i + 1} highlight={i === 0} />)}
          </div>
        </section>
      )}

      {/* Bottom 3 — internal only */}
      {bottom3.length > 0 && igPosts.length > 3 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">Bottom posts (internal only)</h2>
          <div className="space-y-2">
            {bottom3.map((p, i) => <PostRow key={p.id} post={p} rank={igPosts.length - i} dim />)}
          </div>
        </section>
      )}

      {/* AM insight layer */}
      <section className="mb-2">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/35">AM insight layer</h2>
        <Card>
          <div className="space-y-5">
            <AMTextField
              label="Executive summary"
              placeholder="What did this period look like in plain language? The one thing that worked and one thing to address."
              rows={3}
            />
            <AMTextField
              label="Insights and recommendations"
              placeholder="2-3 specific actions. Format: data point → reason → action."
              rows={4}
            />
            <AMTextField
              label="Next period focus"
              placeholder="What will we test, retire, or double down on?"
            />
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
            <p className="text-xs text-white/30">Internal. Not client-facing until exported.</p>
            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium text-white hover:bg-white/12">Save</button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium text-white hover:bg-white/12 disabled:opacity-50"
              >
                <Download size={12} />
                {downloading ? 'Building...' : 'Download'}
              </button>
            </div>
          </div>
        </Card>
      </section>

      {/* Print-only footer */}
      <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400">
        Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · TNT OS by Ascnd · {rangeLabel}
      </div>
    </div>
  )
}

