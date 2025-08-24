import { Navigate } from 'react-router-dom'
// Import the authentication store hook
import { useAuthStore} from '../Store/UserStore.ts'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}