import { Navigate, Route, Routes } from 'react-router-dom'
import { type ReactNode } from 'react'
import { getCurrentUser, type Role } from './lib/auth'
import { Layout } from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminOS from './pages/founder/FounderOS'
import PersonDetail from './pages/founder/PersonDetail'
import AMDashboard from './pages/am/AMDashboard'
import BrandDetail from './pages/am/BrandDetail'
import CreativeBank from './pages/creative/CreativeBank'
import AddEntry from './pages/creative/AddEntry'
import MyBrands from './pages/MyBrands'
import Profile from './pages/Profile'

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode
  allowedRoles: Role[]
}) {
  const user = getCurrentUser()
  if (!user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return <Layout>{children}</Layout>
}

function AuthenticatedRoute({ children }: { children: ReactNode }) {
  const user = getCurrentUser()
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <AuthenticatedRoute>
            <Dashboard />
          </AuthenticatedRoute>
        }
      />

      {/* My Brands everyone */}
      <Route
        path="/brands"
        element={
          <AuthenticatedRoute>
            <MyBrands />
          </AuthenticatedRoute>
        }
      />

      {/* Admin admin + manager only */}
      <Route
        path="/founder"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminOS />
          </ProtectedRoute>
        }
      />
      <Route
        path="/founder/:id"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <PersonDetail />
          </ProtectedRoute>
        }
      />

      {/* AM Tracker admin, manager, am */}
      <Route
        path="/am"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'am']}>
            <AMDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/am/:id"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'am', 'creator']}>
            <BrandDetail />
          </ProtectedRoute>
        }
      />

      {/* Creative Bank everyone */}
      <Route
        path="/creative"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'am', 'creator']}>
            <CreativeBank />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creative/new"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'am', 'creator']}>
            <AddEntry />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <AuthenticatedRoute>
            <Profile />
          </AuthenticatedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
