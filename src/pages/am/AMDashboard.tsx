import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { PlatformBadge } from '../../components/ui/Badge'
import { HealthBadge } from '../../components/ui/HealthBadge'
import {
  getBrandsForUser,
  getBrandHealth,
  getWeekRangeStats,
  formatNumber,
  PULSE_WEEK_IDX,
  PULSE_PERIOD,
} from '../../lib/data'
import { getCurrentUser } from '../../lib/auth'

export default function AMDashboard() {
  const user = getCurrentUser()!
  const brands = getBrandsForUser(user.name, user.role)

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">AM Tracker</h1>
        <p className="mt-1 text-sm text-white/50">
          Weekly pulse — <span className="text-white/70">{PULSE_PERIOD}</span>
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
              <Card hover>
                {/* Top row: brand info + health */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-base font-semibold text-white"
                      style={{ backgroundColor: b.color }}
                    >
                      {b.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{b.name}</div>
                      <div className="text-xs text-white/40 mt-0.5">AM · {b.amName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <HealthBadge signal={health.signal} reason={health.reason} />
                    <ArrowRight size={14} className="text-white/25" />
                  </div>
                </div>

                {/* Pulse week metrics */}
                {pulse && pulse.weeksWithData > 0 ? (
                  <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/8 pt-4">
                    <Metric
                      label="Reach"
                      value={formatNumber(pulse.avgReach)}
                      delta={reachDelta}
                    />
                    <Metric
                      label="Avg ER"
                      value={`${pulse.avgEr.toFixed(2)}%`}
                    />
                    <Metric
                      label="Shares"
                      value={formatNumber(pulse.totalShares)}
                    />
                  </div>
                ) : (
                  <div className="mt-4 border-t border-white/8 pt-4 text-xs text-white/30">
                    No data for this week
                  </div>
                )}

                {/* Platform badges */}
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
