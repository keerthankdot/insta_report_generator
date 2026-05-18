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
    <div className="flex h-screen w-screen overflow-hidden bg-bg">
      <Sidebar user={user} onRoleSwitch={handleRoleSwitch} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
