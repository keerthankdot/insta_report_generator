import { getCurrentUser } from '../lib/auth'
import { Card } from '../components/ui/Card'
import { ROLE_LABELS } from '../lib/auth'

export default function Profile() {
  const user = getCurrentUser()!
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Profile</h1>
        <p className="mt-1 text-sm text-white/50">Your account details.</p>
      </header>
      <Card>
        <div className="space-y-4">
          <Row label="Name"  value={user.name} />
          <Row label="Email" value={user.email} />
          <Row label="Role"  value={ROLE_LABELS[user.role]} />
        </div>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/8 pb-4 last:border-0 last:pb-0">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  )
}
