import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { PlatformBadge } from '../../components/ui/Badge'
import { HealthBadge } from '../../components/ui/HealthBadge'
import {
  getBrandsForUser,
  getBrandHealth,
  getWeekRangeStats,
  formatNumber,
  PULSE_WEEK_IDX,
  type Brand,
} from '../../lib/data'
import { getCurrentUser } from '../../lib/auth'

function BrandLogo({ brand }: { brand: Brand }) {
  const [failed, setFailed] = useState(false)
  if (brand.logoDomain && !failed) {
    return (
      <img
        src={`https://logo.clearbit.com/${brand.logoDomain}`}
        alt={brand.name}
        onError={() => setFailed(true)}
        className="h-11 w-11 rounded-xl object-contain bg-white p-1.5 flex-shrink-0"
      />
    )
  }
  return (
    <div
      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-base font-semibold text-white"
      style={{ backgroundColor: brand.color }}
    >
      {brand.name.charAt(0)}
    </div>
  )
}

export default function AMDashboard() {
  const user = getCurrentUser()!
  const brands = getBrandsForUser(user.name, user.role)

  const now = new Date()
  const daysSinceWed = (now.getDay() + 4) % 7
  const thisWed = new Date(now)
  thisWed.setDate(now.getDate() - daysSinceWed)
  const prevWedStart = new Date(thisWed); prevWedStart.setDate(thisWed.getDate() - 7)
  const prevWedEnd   = new Date(thisWed); prevWedEnd.setDate(thisWed.getDate() - 1)
  const fmt = (dt: Date) => `${dt.getDate()} ${dt.toLocaleDateString('en-GB', { month: 'short' })}`

  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  const dow = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dow)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7) - 1

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">My Brands</h1>
        <p className="mt-1 text-sm text-white/50">
          You are viewing Week {weekNumber} <span className="text-white/30">·</span> {fmt(prevWedStart)} to {fmt(prevWedEnd)}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {brands.map((b) => {
          const health = getBrandHealth(b.id)
          const pulse  = getWeekRangeStats(b.id, [PULSE_WEEK_IDX])
          const prior  = getWeekRangeStats(b.id, [PULSE_WEEK_IDX - 1])

          const reachDelta = pulse && prior && prior.avgReach
            ? ((pulse.avgReach - prior.avgReach) / prior.avgReach) * 100
            : null

          return (
            <Link key={b.id} to={`/am/${b.id}`}>
              <Card hover className="flex flex-col" style={{ height: '200px' }}>
                {/* Top row: brand info + health */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <BrandLogo brand={b} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{b.name}</div>
                      <div className="text-xs text-white/40 mt-0.5">AM · {b.amName}</div>
                    </div>
                  </div>
                  <HealthBadge signal={health.signal} reason={health.reason} />
                </div>

                {/* Pulse week metrics fixed height zone */}
                <div className="mt-4 flex-1 border-t border-white/8 pt-4">
                  {pulse && pulse.weeksWithData > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      <Metric label="Reach" value={formatNumber(pulse.avgReach)} delta={reachDelta} />
                      <Metric label="Avg ER" value={`${pulse.avgEr.toFixed(2)}%`} />
                      <Metric label="Shares" value={formatNumber(pulse.totalShares)} />
                    </div>
                  ) : (
                    <p className="text-xs text-white/30">No data for this week</p>
                  )}
                </div>

                {/* Platform badges pinned to bottom */}
                <div className="mt-3 flex gap-1.5">
                  {b.platforms.map((p) => <PlatformBadge key={p} platform={p} />)}
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function Metric({ label, value, delta }: { label: string; value: string; delta?: number | null }) {
  return (
    <div>
      <div className="text-[10px] text-white/35 uppercase tracking-wide mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
      {delta !== null && delta !== undefined && (
        <div className={`text-[10px] mt-0.5 ${delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {delta >= 0 ? '+' : ''}{delta.toFixed(1)}% vs prior
        </div>
      )}
    </div>
  )
}
