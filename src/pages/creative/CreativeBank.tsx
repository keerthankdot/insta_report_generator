import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Star, X, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import {
  CREATIVE_ENTRIES,
  formatNumber,
  type CreativeEntry,
  type ContentType,
  type Platform,
} from '../../lib/data'

const TYPE_STYLES: Record<ContentType, string> = {
  Reel:     'bg-pink-500/15 text-pink-300 border-pink-500/30',
  Static:   'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Carousel: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Tweet:    'bg-sky-500/15 text-sky-300 border-sky-500/30',
}

export default function CreativeBank() {
  const [contentType, setContentType] = useState<ContentType | 'All'>('All')
  const [platform, setPlatform]       = useState<Platform | 'All'>('All')
  const [minRating, setMinRating]     = useState(0)
  const [selected, setSelected]       = useState<CreativeEntry | null>(null)

  const filtered = useMemo(
    () =>
      CREATIVE_ENTRIES.filter(
        (e) =>
          (contentType === 'All' || e.contentType === contentType) &&
          (platform === 'All' || e.platform === platform) &&
          e.selfRating >= minRating,
      ),
    [contentType, platform, minRating],
  )

  return (
    <div>
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Creative Bank</h1>
          <p className="mt-1 text-sm text-white/50">
            What shipped, what worked, what to change.
          </p>
        </div>
        <Link
          to="/creative/new"
          className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/12"
        >
          <Plus size={14} />
          Log entry
        </Link>
      </header>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <FilterSelect
          label="Type"
          value={contentType}
          onChange={(v) => setContentType(v as ContentType | 'All')}
          options={['All', 'Reel', 'Static', 'Carousel', 'Tweet']}
        />
        <FilterSelect
          label="Platform"
          value={platform}
          onChange={(v) => setPlatform(v as Platform | 'All')}
          options={['All', 'Instagram', 'X', 'LinkedIn', 'YouTube']}
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
                <Badge className={TYPE_STYLES[entry.contentType]}>{entry.contentType}</Badge>
                <div className="flex items-center gap-2">
                  {entry.benchmarkMet !== undefined && (
                    entry.benchmarkMet
                      ? <CheckCircle size={13} className="text-emerald-400" />
                      : <XCircle size={13} className="text-red-400/70" />
                  )}
                  <RatingStars rating={entry.selfRating} />
                </div>
              </div>

              <div className="mt-3 text-sm font-semibold leading-snug text-white line-clamp-2">
                {entry.title}
              </div>

              {entry.explainRating && (
                <p className="mt-2 text-xs leading-relaxed text-white/50 line-clamp-2">
                  {entry.explainRating}
                </p>
              )}

              {/* metrics strip */}
              {(entry.views || entry.likes || entry.shares) ? (
                <div className="mt-3 flex gap-4 text-xs text-white/40">
                  {entry.views  != null && <span><span className="font-medium text-white">{formatNumber(entry.views)}</span> views</span>}
                  {entry.likes  != null && <span><span className="font-medium text-white">{formatNumber(entry.likes)}</span> likes</span>}
                  {entry.shares != null && <span><span className="font-medium text-white">{formatNumber(entry.shares)}</span> shares</span>}
                </div>
              ) : null}

              <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-xs text-white/35">
                <span>{entry.platform} · {entry.brand}</span>
                <span>{entry.creatorName}</span>
              </div>
            </Card>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-white/8 bg-white/4 p-8 text-center text-sm text-white/40">
            No entries match these filters.
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#1c1c1e] p-6 shadow-2xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={TYPE_STYLES[selected.contentType]}>{selected.contentType}</Badge>
                <Badge className="border-white/10 bg-white/5 text-white/50">{selected.platform}</Badge>
                <Badge className="border-white/10 bg-white/5 text-white/50">{selected.brand}</Badge>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1 text-white/40 hover:bg-white/5 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <h2 className="text-lg font-semibold text-white">{selected.title}</h2>

            {selected.liveLink && (
              <a
                href={selected.liveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-xs text-white/35 hover:text-white/60 underline underline-offset-2 truncate"
              >
                {selected.liveLink}
              </a>
            )}

            <div className="mt-3 flex items-center gap-3">
              <RatingStars rating={selected.selfRating} />
              <span className="text-xs text-white/35">{selected.selfRating}/5 self rating</span>
              {selected.benchmarkMet !== undefined && (
                <span className={`ml-auto text-xs font-medium flex items-center gap-1 ${selected.benchmarkMet ? 'text-emerald-400' : 'text-red-400/70'}`}>
                  {selected.benchmarkMet ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  Benchmark {selected.benchmarkMet ? 'met' : 'not met'}
                </span>
              )}
            </div>

            {/* metrics */}
            {(selected.views || selected.likes || selected.shares) ? (
              <div className="mt-4 flex gap-6 rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-xs">
                {selected.views  != null && <div><div className="text-base font-bold text-white">{formatNumber(selected.views)}</div><div className="text-white/35">views</div></div>}
                {selected.likes  != null && <div><div className="text-base font-bold text-white">{formatNumber(selected.likes)}</div><div className="text-white/35">likes</div></div>}
                {selected.shares != null && <div><div className="text-base font-bold text-white">{formatNumber(selected.shares)}</div><div className="text-white/35">shares</div></div>}
              </div>
            ) : null}

            {selected.explainRating && (
              <Section label="Insight">{selected.explainRating}</Section>
            )}
            {selected.whatIdChange && (
              <Section label="What I'd change">{selected.whatIdChange}</Section>
            )}
            {selected.otherWins && (
              <Section label="Other wins">{selected.otherWins}</Section>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-4 text-xs text-white/35">
              <span>Logged by {selected.creatorName}</span>
              <span>{selected.dateAdded}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">{label}</div>
      <p className="text-sm leading-relaxed text-white/80">{children}</p>
    </div>
  )
}

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 py-2">
      <span className="text-xs text-white/35">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs font-medium text-white focus:outline-none"
      >
        {options.map((o) => <option key={o} value={o} className="bg-[#1c1c1e]">{o}</option>)}
      </select>
    </label>
  )
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={11} className={i <= rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'} />
      ))}
    </div>
  )
}
