import { Navigate } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';
import Loading from '../shared/components/UI/Loading';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar roles si se especifican
  if (roles.length > 0 && !roles.includes(user?.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;