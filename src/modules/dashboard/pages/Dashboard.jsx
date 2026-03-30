import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../../../shared/hooks/useAuth';
import reporteService from '../../reportes/services/reporte.service';
import KPIGrid            from '../components/KPIGrid';
import VentasChart        from '../components/VentasChart';
import TopProductosChart  from '../components/TopProductosChart';
import UltimasVentas      from '../components/UltimasVentas';
import AccesoRapido       from '../components/AccesoRapido';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [kpis,          setKpis]          = useState(null);
  const [ventas7dias,   setVentas7dias]   = useState([]);
  const [topProductos,  setTopProductos]  = useState([]);
  const [ultimasVentas, setUltimasVentas] = useState([]);

  const cargarDatos = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const [kpisData, ventas, productos, ultimas] = await Promise.all([
        reporteService.getKPIs(),
        reporteService.getVentasUltimos7Dias(),
        reporteService.getTopProductosHoy(6),
        reporteService.getUltimasVentas(6),
      ]);
      setKpis(kpisData);
      setVentas7dias(ventas);
      setTopProductos(productos);
      setUltimasVentas(ultimas);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Hola, {user?.nombre?.split(' ')[0] || 'Usuario'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => cargarDatos(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* KPIs */}
      <KPIGrid kpis={kpis} loading={loading} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <VentasChart       datos={ventas7dias}  loading={loading} />
        <TopProductosChart datos={topProductos} loading={loading} />
      </div>

      {/* Últimas ventas + Acceso rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UltimasVentas datos={ultimasVentas} loading={loading} />
        <AccesoRapido />
      </div>
    </div>
  );
};

export default Dashboard;
