import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RoleRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.rol)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}