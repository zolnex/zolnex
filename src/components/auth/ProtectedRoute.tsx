import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { ReactNode } from 'react'
import type { UserRole } from '../../types'

/**
 * Guards routes that require an authenticated user (and optionally a specific
 * role). In demo mode every visitor is treated as the demo developer so the
 * protected pages remain explorable.
 */
export function ProtectedRoute({
  children,
  requireRole,
}: {
  children: ReactNode
  requireRole?: UserRole
}) {
  const { profile, loading, role } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-acid" />
      </div>
    )
  }

  if (!profile) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />
  }

  if (requireRole && role !== requireRole && role !== 'admin') {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="display text-2xl">Access denied</h1>
        <p className="mt-2 text-mute">
          You need the <code className="text-acid">{requireRole}</code> role
          to view this page.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
