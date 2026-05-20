import type { HealthSignal } from '../../lib/data'

const STYLES: Record<HealthSignal, { dot: string; bg: string; text: string }> = {
  green: { dot: 'bg-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' },
  amber: { dot: 'bg-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',     text: 'text-amber-400'   },
  red:   { dot: 'bg-red-400',     bg: 'bg-red-500/10 border-red-500/20',         text: 'text-red-400'     },
}

export function HealthBadge({ signal, reason }: { signal: HealthSignal; reason: string }) {
  const s = STYLES[signal]
  return (
    <div className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 ${s.bg}`}>
      <div className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${s.dot}`} />
      <span className={`text-[11px] font-medium ${s.text}`}>{reason}</span>
    </div>
  )
}
