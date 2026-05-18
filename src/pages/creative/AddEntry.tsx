import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { getCurrentUser } from '../../lib/auth'
import type { ContentCategory, Platform } from '../../lib/data'

const CATEGORIES: ContentCategory[] = ['Humour', 'Trend', 'Education', 'Storytelling', 'Promo']
const PLATFORMS: Platform[] = ['Instagram', 'LinkedIn', 'YouTube', 'X']
const BRAND_NAMES = ['Tinder India', 'Dunkin India']

export default function AddEntry() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    category: 'Humour' as ContentCategory,
    platform: 'Instagram' as Platform,
    brand: BRAND_NAMES[0],
    title: '',
    insight: '',
    rating: 4,
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => navigate('/creative'), 1200)
  }

  return (
    <div>
      <Link
        to="/creative"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft size={14} />
        Back to bank
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
          New entry
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Log what you learned. The team draws on this when planning briefs.
        </p>
      </header>

      <Card>
        {submitted ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              ✓
            </div>
            <div className="text-base font-semibold text-text-primary">Entry saved.</div>
            <div className="mt-1 text-xs text-text-secondary">Redirecting...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ContentCategory })}
                  className="form-input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-surface">
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Platform">
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}
                  className="form-input"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p} className="bg-surface">
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Brand">
                <select
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="form-input"
                >
                  {BRAND_NAMES.map((b) => (
                    <option key={b} value={b} className="bg-surface">
                      {b}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Title">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Pickle juice donut reel"
                className="form-input"
                required
              />
            </Field>

            <Field label="Insight">
              <textarea
                rows={5}
                value={form.insight}
                onChange={(e) => setForm({ ...form, insight: e.target.value })}
                placeholder="What did you ship, what worked or didn't, and what should we do next time?"
                className="form-input"
                required
              />
            </Field>

            <Field label="Rating">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm({ ...form, rating: i })}
                    className="rounded p-1 transition-colors hover:bg-white/5"
                  >
                    <Star
                      size={18}
                      className={
                        i <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-text-muted'
                      }
                    />
                  </button>
                ))}
              </div>
            </Field>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="text-xs text-text-muted">Logged as {user?.name ?? 'Guest'}</div>
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Save entry
              </button>
            </div>
          </form>
        )}
      </Card>

      <style>{`.form-input{width:100%;border-radius:0.5rem;border:1px solid rgba(255,255,255,0.08);background:#0e1117;padding:0.625rem 0.75rem;font-size:0.875rem;color:#fff;outline:none}.form-input:focus{border-color:#2563eb;box-shadow:0 0 0 2px rgba(37,99,235,0.3)}.form-input::placeholder{color:rgba(255,255,255,0.35)}`}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</label>
      {children}
    </div>
  )
}
