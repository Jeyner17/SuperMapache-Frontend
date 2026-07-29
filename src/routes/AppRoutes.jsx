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
import Caja from '../modules/caja/pages/Caja';
import Creditos from '../modules/creditos/pages/Creditos';
import Alertas    from '../modules/alertas/pages/Alertas';
import Gastos     from '../modules/gastos/pages/Gastos';
import Auditoria  from '../modules/auditoria/pages/Auditoria';
import Reportes   from '../modules/reportes/pages/Reportes';
import Empleados  from '../modules/empleados/pages/Empleados';
import CajaSimple from '../modules/caja-simple/pages/CajaSimple';

// Components
import Loading from '../shared/components/UI/Loading';
import NotFound from '../shared/components/Common/NotFound';
import ProtectedRoute from './ProtectedRoute';

const ROLES_CAJA_SIMPLE = ['cajero_simple', 'administrador', 'supervisor', 'cajero'];
const ROLES_EXCLUIDOS_MAIN = ['cajero_simple'];

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return <Loading message="Cargando aplicación..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Caja Simple — pantalla completa sin sidebar ni navbar */}
        <Route
          path="/caja-simple"
          element={
            <ProtectedRoute roles={ROLES_CAJA_SIMPLE} redirectTo="/dashboard">
              <CajaSimple />
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas con MainLayout — cajero_simple es redirigido a /caja-simple */}
        <Route
          path="/"
          element={
            <ProtectedRoute excludeRoles={ROLES_EXCLUIDOS_MAIN} redirectTo="/caja-simple">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="productos" element={<Productos />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="escaneo" element={<VerificacionProductos />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="compras" element={<Compras />} />
          <Route path="pos" element={<POS />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="caja" element={<Caja />} />
          <Route path="creditos" element={<Creditos />} />
          <Route path="gastos"    element={<Gastos />} />
          <Route path="alertas"   element={<Alertas />} />
          <Route path="auditoria" element={<Auditoria />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
