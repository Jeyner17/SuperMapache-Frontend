import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';

// Layouts
import MainLayout from '../shared/components/Layout/MainLayout';

// Pages
import Login from '../modules/auth/pages/Login';
import Dashboard from '../modules/dashboard/pages/Dashboard';
import Categorias from '../modules/categorias/pages/Categorias';
import Productos from '../modules/productos/pages/Productos';
import Inventario from '../modules/inventario/pages/Inventario';


// Components
import Loading from '../shared/components/UI/Loading';
import NotFound from '../shared/components/Common/NotFound';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return <Loading message="Cargando aplicación..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública - Login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Sprint 2 - Categorías y Productos */}
          <Route path="categorias" element={<Categorias />} />
          <Route path="productos" element={<Productos />} />
          
          {/* Sprint 3 - Inventario */}
          <Route path="inventario" element={<Inventario />} />
          
          {/* Placeholder para otros módulos */}
          <Route path="empleados" element={<div className="text-2xl font-bold text-gray-800 dark:text-white">Módulo Empleados (Sprint 2)</div>} />
          <Route path="proveedores" element={<div className="text-2xl font-bold text-gray-800 dark:text-white">Módulo Proveedores (Sprint 5)</div>} />
          <Route path="compras" element={<div className="text-2xl font-bold text-gray-800 dark:text-white">Módulo Compras (Sprint 5)</div>} />
          <Route path="pos" element={<div className="text-2xl font-bold text-gray-800 dark:text-white">Módulo POS (Sprint 6)</div>} />
          <Route path="caja" element={<div className="text-2xl font-bold text-gray-800 dark:text-white">Módulo Caja (Sprint 7)</div>} />
          <Route path="creditos" element={<div className="text-2xl font-bold text-gray-800 dark:text-white">Módulo Créditos (Sprint 7)</div>} />
          <Route path="gastos" element={<div className="text-2xl font-bold text-gray-800 dark:text-white">Módulo Gastos (Sprint 9)</div>} />
          <Route path="alertas" element={<div className="text-2xl font-bold text-gray-800 dark:text-white">Módulo Alertas (Sprint 8)</div>} />
          <Route path="auditoria" element={<div className="text-2xl font-bold text-gray-800 dark:text-white">Módulo Auditoría (Sprint 9)</div>} />
          <Route path="reportes" element={<div className="text-2xl font-bold text-gray-800 dark:text-white">Módulo Reportes (Sprint 10)</div>} />
          <Route path="configuracion" element={<div className="text-2xl font-bold text-gray-800 dark:text-white">Módulo Configuración (Sprint 1)</div>} />
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;