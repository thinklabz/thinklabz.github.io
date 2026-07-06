import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { User } from 'firebase/auth'
import { getCurrentUser, onAuthStateChange } from '../services/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    // Check current user immediately
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setLoading(false)
    }

    return () => unsubscribe()
  }, [])

  if (loading) {
    return null // or a loading spinner
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
