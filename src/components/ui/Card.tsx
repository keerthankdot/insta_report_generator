import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = false, ...rest }: CardProps) {
  const hoverClasses = hover
    ? 'transition-colors hover:border-white/20 hover:bg-[#222226] cursor-pointer'
    : ''
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-5 ${hoverClasses} ${className}`}
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
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wider text-text-muted">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-text-primary">{value}</div>
      {sub && <div className="mt-1 text-xs text-text-secondary">{sub}</div>}
    </Card>
  )
}
