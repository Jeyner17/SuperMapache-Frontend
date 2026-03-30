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
import Proveedores from '../modules/proveedores/pages/Proveedores';
import Compras from '../modules/compras/pages/Compras';
import VerificacionProductos from '../modules/escaneo/pages/VerificacionProductos';
import POS from '../modules/ventas/pages/POS';
import Configuracion from '../modules/configuracion/pages/Configuracion';
import Caja from '../modules/caja/pages/Caja';
import Creditos from '../modules/creditos/pages/Creditos';
import Alertas    from '../modules/alertas/pages/Alertas';
import Gastos     from '../modules/gastos/pages/Gastos';
import Auditoria  from '../modules/auditoria/pages/Auditoria';
import Reportes   from '../modules/reportes/pages/Reportes';

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
          {/* Sprint 1 - Configuración */}
          <Route path="configuracion" element={<Configuracion />} />

          {/* Sprint 2 - Categorías y Productos */}
          <Route path="categorias" element={<Categorias />} />
          <Route path="productos" element={<Productos />} />
          
          {/* Sprint 3 - Inventario */}
          <Route path="inventario" element={<Inventario />} />

          {/* Sprint 4 - Escaneo de Códigos de Barras */}
          <Route path="escaneo" element={<VerificacionProductos />} />

           {/* Sprint 5 - Proveedores y Compras */}
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="compras" element={<Compras />} />

          {/* Sprint 6 - POS */}
          <Route path="pos" element={<POS />} />
          
          {/* Placeholder para otros módulos */}
          <Route path="empleados" element={<div className="text-2xl font-bold text-gray-800 dark:text-white">Módulo Empleados (Sprint 2)</div>} />
          <Route path="caja" element={<Caja />} />
          <Route path="creditos" element={<Creditos />} />
          <Route path="gastos"    element={<Gastos />} />
          <Route path="alertas"   element={<Alertas />} />
          <Route path="auditoria" element={<Auditoria />} />
          <Route path="reportes" element={<Reportes />} />          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;