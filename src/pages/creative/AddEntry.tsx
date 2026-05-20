import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { getCurrentUser } from '../../lib/auth'
import { BRANDS, type ContentCategory, type ContentType, type Platform } from '../../lib/data'

const CONTENT_TYPES: ContentType[] = ['Reel', 'Static', 'Carousel', 'Tweet']
const PLATFORMS: Platform[] = ['Instagram', 'X', 'LinkedIn', 'YouTube']
const BRAND_NAMES = BRANDS.map((b) => b.name)

export default function AddEntry() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    brand: BRAND_NAMES[0],
    title: '',
    liveLink: '',
    contentType: 'Reel' as ContentType,
    category: 'Humour' as ContentCategory,
    platform: 'Instagram' as Platform,
    views: '',
    likes: '',
    shares: '',
    benchmarkMet: '' as '' | 'yes' | 'no',
    selfRating: 3,
    explainRating: '',
    whatIdChange: '',
    otherWins: '',
  })

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => navigate('/creative'), 1400)
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-xl">
            ✓
          </div>
          <div className="text-base font-semibold text-white">Entry saved.</div>
          <div className="mt-1 text-xs text-white/40">Redirecting to Creative Bank...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/creative"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white"
      >
        <ArrowLeft size={14} />
        Back to bank
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Log entry</h1>
        <p className="mt-1 text-sm text-white/50">
          Fill before your pod meeting — every alternate Friday.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: brand + content type + platform */}
        <Card>
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/35">Post details</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Brand">
              <select value={form.brand} onChange={(e) => set('brand', e.target.value)} className="form-input">
                {BRAND_NAMES.map((b) => <option key={b} value={b} className="bg-[#0e1117]">{b}</option>)}
              </select>
            </Field>
            <Field label="Type of content">
              <select value={form.contentType} onChange={(e) => set('contentType', e.target.value)} className="form-input">
                {CONTENT_TYPES.map((t) => <option key={t} value={t} className="bg-[#0e1117]">{t}</option>)}
              </select>
            </Field>
            <Field label="Platform">
              <select value={form.platform} onChange={(e) => set('platform', e.target.value)} className="form-input">
                {PLATFORMS.map((p) => <option key={p} value={p} className="bg-[#0e1117]">{p}</option>)}
              </select>
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Met Gala | If the theme was art..."
                className="form-input"
                required
              />
            </Field>
            <Field label="Live link">
              <input
                type="url"
                value={form.liveLink}
                onChange={(e) => set('liveLink', e.target.value)}
                placeholder="https://www.instagram.com/p/..."
                className="form-input"
              />
            </Field>
          </div>
        </Card>

        {/* Row 2: metrics */}
        <Card>
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/35">Metrics</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Views">
              <input type="number" value={form.views} onChange={(e) => set('views', e.target.value)} placeholder="e.g. 21900" className="form-input" />
            </Field>
            <Field label="Likes">
              <input type="number" value={form.likes} onChange={(e) => set('likes', e.target.value)} placeholder="e.g. 6914" className="form-input" />
            </Field>
            <Field label="Shares">
              <input type="number" value={form.shares} onChange={(e) => set('shares', e.target.value)} placeholder="e.g. 273" className="form-input" />
            </Field>
            <Field label="Brand benchmark met?">
              <select value={form.benchmarkMet} onChange={(e) => set('benchmarkMet', e.target.value)} className="form-input">
                <option value="" className="bg-[#0e1117]">—</option>
                <option value="yes" className="bg-[#0e1117]">Yes</option>
                <option value="no" className="bg-[#0e1117]">No</option>
              </select>
            </Field>
          </div>
        </Card>

        {/* Row 3: insight + rating */}
        <Card>
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/35">Reflection</p>

          <Field label="Insight">
            <textarea
              rows={3}
              value={form.explainRating}
              onChange={(e) => set('explainRating', e.target.value)}
              placeholder="What was the core insight or hook behind this post?"
              className="form-input"
            />
          </Field>

          <div className="mt-4">
            <Field label="What I'd change">
              <textarea
                rows={3}
                value={form.whatIdChange}
                onChange={(e) => set('whatIdChange', e.target.value)}
                placeholder="If you could redo this post, what would you do differently?"
                className="form-input"
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Other wins">
              <textarea
                rows={2}
                value={form.otherWins}
                onChange={(e) => set('otherWins', e.target.value)}
                placeholder="Earned media, ORM wins, brand reactions, etc."
                className="form-input"
              />
            </Field>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-xs font-medium text-white/50">Self rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => set('selfRating', i)}
                  className="rounded p-1 transition-colors hover:bg-white/5"
                >
                  <Star
                    size={20}
                    className={i <= form.selfRating ? 'fill-amber-400 text-amber-400' : 'text-white/20'}
                  />
                </button>
              ))}
              <span className="ml-2 self-center text-xs text-white/35">{form.selfRating}/5</span>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-white/30">Logged as {user?.name ?? 'Guest'}</div>
          <button
            type="submit"
            className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/15 border border-white/15"
          >
            Save entry
          </button>
        </div>
      </form>

      <style>{`.form-input{width:100%;border-radius:0.5rem;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);padding:0.625rem 0.75rem;font-size:0.875rem;color:#fff;outline:none}.form-input:focus{border-color:rgba(255,255,255,0.25)}.form-input::placeholder{color:rgba(255,255,255,0.25)}`}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white/50">{label}</label>
      {children}
    </div>
  )
}
