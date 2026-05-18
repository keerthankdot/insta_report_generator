import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  getMetricsForBrand,
  getAMNotesForBrand,
  ENGAGEMENT_TREND,
  formatNumber,
  formatDate,
} from '../../lib/data'

const CHART_COLORS: Record<string, string> = {
  Instagram: '#e1306c',
  LinkedIn: '#0077b5',
  YouTube: '#ff0000',
  X: '#ffffff',
}

export default function BrandDetail() {
  const { id } = useParams<{ id: string }>()
  const brand = id ? getBrandById(id) : undefined
  const metrics = id ? getMetricsForBrand(id) : undefined
  const trend = id ? ENGAGEMENT_TREND[id] ?? [] : []
  const amNotes = id ? getAMNotesForBrand(id) : []

  if (!brand || !metrics) return <Navigate to="/am" replace />

  // Build comparison bar chart
  const platformComparison = metrics.platforms.map((p) => ({
    platform: p.platform,
    value: p.primary.value,
  }))

  const activePlatforms = brand.platforms

  return (
    <div>
      <Link
        to="/am"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
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
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
              {brand.name}
            </h1>
            <div className="mt-1 text-sm text-text-secondary">
              AM · {brand.amName} · Week ending {formatDate(metrics.weekEnding)}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {brand.platforms.map((p) => (
            <PlatformBadge key={p} platform={p} />
          ))}
        </div>
      </header>

      {/* Metrics — primary stat per platform */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          This week
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {metrics.platforms.map((p) => (
            <StatCard
              key={p.platform}
              label={`${p.platform} · ${p.primary.label}`}
              value={formatNumber(p.primary.value)}
              sub={p.secondary
                .map((s) => `${s.label} ${formatNumber(s.value)}`)
                .join(' · ')}
            />
          ))}
        </div>
      </section>

      {/* Charts */}
      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Engagement trend" subtitle="4 week view" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={11}
                  tickFormatter={formatNumber}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1c1c1e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => formatNumber(v)}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {activePlatforms
                  .filter((p) => p !== 'X')
                  .map((p) => (
                    <Line
                      key={p}
                      type="monotone"
                      dataKey={p}
                      stroke={CHART_COLORS[p]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Platform comparison" subtitle="This week" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="platform" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={11}
                  tickFormatter={formatNumber}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1c1c1e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => formatNumber(v)}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* AM Notes */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          AM notes
        </h2>
        <div className="space-y-3">
          {amNotes.map((n) => (
            <Card key={n.id}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-text-primary">{n.author}</span>
                <span className="text-xs text-text-muted">{formatDate(n.date)}</span>
              </div>
              <p className="text-sm leading-relaxed text-text-primary">{n.content}</p>
            </Card>
          ))}
          {/* Add note placeholder */}
          <Card>
            <textarea
              rows={2}
              placeholder="Add an AM note..."
              className="w-full resize-none bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
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
