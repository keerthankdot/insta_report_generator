import type { ReactNode } from 'react'
import type { NoteType, Trajectory, Urgency } from '../../lib/data'

const TRAJECTORY_STYLES: Record<Trajectory, string> = {
  Rising: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Steady: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Needs Attention': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  New: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
}

const NOTE_STYLES: Record<NoteType, string> = {
  Win: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Loss: 'bg-red-500/15 text-red-400 border-red-500/30',
  'Growth Note': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Feedback Area': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Observation: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
}

const URGENCY_STYLES: Record<Urgency, string> = {
  Low: 'bg-white/5 text-text-secondary border-white/10',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  High: 'bg-red-500/15 text-red-400 border-red-500/30',
}

interface BadgeProps {
  children: ReactNode
  className?: string
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  )
}

export function TrajectoryBadge({ trajectory }: { trajectory: Trajectory }) {
  return <Badge className={TRAJECTORY_STYLES[trajectory]}>{trajectory}</Badge>
}

export function NoteTypeBadge({ type }: { type: NoteType }) {
  return <Badge className={NOTE_STYLES[type]}>{type}</Badge>
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return <Badge className={URGENCY_STYLES[urgency]}>{urgency}</Badge>
}

export function PlatformBadge({ platform }: { platform: string }) {
  return (
    <Badge className="bg-white/5 text-text-secondary border-white/10">{platform}</Badge>
  )
}
