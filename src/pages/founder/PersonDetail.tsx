import { useMemo, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import {
  NoteTypeBadge,
  TrajectoryBadge,
  UrgencyBadge,
} from '../../components/ui/Badge'
import {
  getNotesForPerson,
  getPersonById,
  formatDate,
  type Note,
  type NoteType,
  type Urgency,
} from '../../lib/data'

export default function PersonDetail() {
  const { id } = useParams<{ id: string }>()
  const person = id ? getPersonById(id) : undefined
  const baseNotes = id ? getNotesForPerson(id) : []
  const [extraNotes, setExtraNotes] = useState<Note[]>([])
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState<{ type: NoteType; urgency: Urgency; content: string }>({
    type: 'Observation',
    urgency: 'Low',
    content: '',
  })

  const allNotes = useMemo(
    () => [...extraNotes, ...baseNotes].sort((a, b) => b.date.localeCompare(a.date)),
    [extraNotes, baseNotes],
  )

  if (!person) return <Navigate to="/admin" replace />

  const recent = allNotes.slice(0, 3)

  const handleAdd = () => {
    if (!draft.content.trim()) return
    const newNote: Note = {
      id: `local-${Date.now()}`,
      personId: person.id,
      date: new Date().toISOString().slice(0, 10),
      type: draft.type,
      urgency: draft.urgency,
      content: draft.content.trim(),
      authorName: 'You',
    }
    setExtraNotes((prev) => [newNote, ...prev])
    setDraft({ type: 'Observation', urgency: 'Low', content: '' })
    setShowForm(false)
  }

  return (
    <div>
      <Link
        to="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft size={14} />
        Back to people
      </Link>

      {/* Header */}
      <header className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-xl font-semibold text-accent">
            {person.avatarInitials}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
              {person.name}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-text-secondary">
              <span>{person.role}</span>
              <span className="text-text-muted">·</span>
              <span>{person.team}</span>
              <TrajectoryBadge trajectory={person.trajectory} />
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
        >
          <Plus size={14} />
          Add Note
        </button>
      </header>

      {/* Inline Add Form */}
      {showForm && (
        <Card className="mb-6">
          <div className="text-sm font-semibold text-text-primary">New note</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-text-secondary">Type</label>
              <select
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value as NoteType })}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
              >
                {(['Win', 'Loss', 'Growth Note', 'Feedback Area', 'Observation'] as NoteType[]).map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-text-secondary">Urgency</label>
              <select
                value={draft.urgency}
                onChange={(e) => setDraft({ ...draft, urgency: e.target.value as Urgency })}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
              >
                {(['Low', 'Medium', 'High'] as Urgency[]).map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-xs text-text-secondary">Content</label>
            <textarea
              rows={3}
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              placeholder="What happened?"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg px-3 py-2 text-xs text-text-secondary hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white hover:bg-accent-hover"
            >
              Save note
            </button>
          </div>
        </Card>
      )}

      {/* Recent notes */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Last 3 notes: 1:1 prep
        </h2>
        <div className="space-y-3">
          {recent.map((n) => (
            <NoteRow key={n.id} note={n} />
          ))}
        </div>
      </section>

      {/* Full timeline */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Full timeline ({allNotes.length})
        </h2>
        <div className="space-y-3">
          {allNotes.map((n) => (
            <NoteRow key={n.id} note={n} />
          ))}
        </div>
      </section>
    </div>
  )
}

function NoteRow({ note }: { note: Note }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <NoteTypeBadge type={note.type} />
            <UrgencyBadge urgency={note.urgency} />
            <span className="text-xs text-text-muted">{formatDate(note.date)}</span>
            <span className="text-xs text-text-muted">· {note.authorName}</span>
          </div>
          <p className="text-sm leading-relaxed text-text-primary">{note.content}</p>
        </div>
      </div>
    </Card>
  )
}
