import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.rol)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}