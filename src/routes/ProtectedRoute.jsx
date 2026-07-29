import { Navigate } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';
import Loading from '../shared/components/UI/Loading';

const ProtectedRoute = ({ children, roles = [], excludeRoles = [], redirectTo = '/dashboard' }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir roles excluidos (ej. cajero_simple fuera del layout principal)
  if (excludeRoles.length > 0 && excludeRoles.includes(user?.rol)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Verificar roles permitidos si se especifican
  if (roles.length > 0 && !roles.includes(user?.rol)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;
