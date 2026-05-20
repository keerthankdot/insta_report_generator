import type { HTMLAttributes, ReactNode } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = false, style, ...rest }: CardProps) {
  const hoverClasses = hover
    ? 'transition-all hover:border-white/25 hover:bg-white/10 cursor-pointer'
    : ''
  return (
    <div
      className={`rounded-2xl border border-white/10 p-5 ${hoverClasses} ${className}`}
      style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-start justify-between">
      <div>
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({
  label,
  value,
  delta,
}: {
  label: string
  value: string | number
  delta?: number
}) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wider text-white">{label}</div>
      <div className="mt-2 text-4xl font-bold text-white">{value}</div>
      <div className="mt-1.5 h-4">
        {delta !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {delta >= 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {Math.abs(delta).toFixed(1)}% vs last week
          </span>
        )}
      </div>
    </Card>
  )
}
