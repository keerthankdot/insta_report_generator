import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { getCurrentUser, type Role } from '../../lib/auth'
import { Navigate } from 'react-router-dom'

export function Layout({ children }: { children: ReactNode }) {
  const initial = getCurrentUser()
  const [user, setUser] = useState(initial)

  if (!user) return <Navigate to="/login" replace />

  const handleRoleSwitch = (role: Role) => {
    setUser({ ...user, role })
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden" style={{ background: '#0a0a0c' }}>
      {/* Background image portrait source rotated 90° clockwise to fill landscape */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <img
          src="/background.jpg"
          alt=""
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100vh',
            height: '100vw',
            transform: 'translate(-50%, -50%) rotate(90deg)',
            objectFit: 'cover',
          }}
        />
      </div>

      <div className="relative z-10">
        <Sidebar user={user} onRoleSwitch={handleRoleSwitch} />
        <main className="ml-[256px] min-h-screen">
          <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
