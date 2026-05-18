import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Star, X } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import {
  CREATIVE_ENTRIES,
  formatDate,
  type CreativeEntry,
  type ContentCategory,
  type Platform,
} from '../../lib/data'

const CATEGORY_STYLES: Record<ContentCategory, string> = {
  Humour: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  Trend: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Education: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Storytelling: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Promo: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
}

export default function CreativeBank() {
  const [category, setCategory] = useState<ContentCategory | 'All'>('All')
  const [platform, setPlatform] = useState<Platform | 'All'>('All')
  const [minRating, setMinRating] = useState(0)
  const [selected, setSelected] = useState<CreativeEntry | null>(null)

  const filtered = useMemo(
    () =>
      CREATIVE_ENTRIES.filter(
        (e) =>
          (category === 'All' || e.category === category) &&
          (platform === 'All' || e.platform === platform) &&
          e.rating >= minRating,
      ),
    [category, platform, minRating],
  )

  return (
    <div>
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
            Creative Bank
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Searchable library of what worked, what didn't, and why.
          </p>
        </div>
        <Link
          to="/creative/new"
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
        >
          <Plus size={14} />
          Add Entry
        </Link>
      </header>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <FilterSelect
          label="Category"
          value={category}
          onChange={(v) => setCategory(v as ContentCategory | 'All')}
          options={['All', 'Humour', 'Trend', 'Education', 'Storytelling', 'Promo']}
        />
        <FilterSelect
          label="Platform"
          value={platform}
          onChange={(v) => setPlatform(v as Platform | 'All')}
          options={['All', 'Instagram', 'LinkedIn', 'YouTube', 'X']}
        />
        <FilterSelect
          label="Min rating"
          value={String(minRating)}
          onChange={(v) => setMinRating(Number(v))}
          options={['0', '1', '2', '3', '4', '5']}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((entry) => (
          <button key={entry.id} onClick={() => setSelected(entry)} className="text-left">
            <Card hover className="h-full">
              <div className="flex items-center justify-between">
                <Badge className={CATEGORY_STYLES[entry.category]}>{entry.category}</Badge>
                <RatingStars rating={entry.rating} />
              </div>
              <div className="mt-3 text-sm font-semibold leading-snug text-text-primary line-clamp-2">
                {entry.title}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary line-clamp-3">
                {entry.insight}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-text-muted">
                <span>{entry.platform} · {entry.brand}</span>
                <span>{entry.creatorName}</span>
              </div>
            </Card>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-border bg-surface p-8 text-center text-sm text-text-secondary">
            No entries match these filters.
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-border bg-surface p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={CATEGORY_STYLES[selected.category]}>{selected.category}</Badge>
                <Badge className="bg-white/5 text-text-secondary border-white/10">
                  {selected.platform}
                </Badge>
                <Badge className="bg-white/5 text-text-secondary border-white/10">
                  {selected.brand}
                </Badge>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1 text-text-secondary hover:bg-white/5 hover:text-text-primary"
              >
                <X size={16} />
              </button>
            </div>
            <h2 className="text-xl font-semibold text-text-primary">{selected.title}</h2>
            <div className="mt-2 flex items-center gap-3">
              <RatingStars rating={selected.rating} />
              <span className="text-xs text-text-muted">{selected.rating}/5</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-text-primary">{selected.insight}</p>
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-text-secondary">
              <span>Logged by {selected.creatorName}</span>
              <span>{formatDate(selected.dateAdded)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
      <span className="text-xs text-text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs font-medium text-text-primary focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-surface">
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= rating ? 'fill-amber-400 text-amber-400' : 'text-text-muted'}
        />
      ))}
    </div>
  )
}
