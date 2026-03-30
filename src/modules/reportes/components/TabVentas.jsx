import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Card from '../../../shared/components/UI/Card';
import Button from '../../../shared/components/UI/Button';
import { useAuth } from '../../../shared/hooks/useAuth';
import reporteService from '../services/reporte.service';
import { formatCurrency } from '../../../shared/utils/formatters';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

const Spinner = () => (
  <div className="h-52 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const TabVentas = ({ desde, hasta, agrupacion, onExportar, exporting }) => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  const [loading, setLoading] = useState(false);
  const [ventasPeriodo, setVentasPeriodo] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [ventasPorCajero, setVentasPorCajero] = useState([]);
  const [ventasPorCategoria, setVentasPorCategoria] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const [periodo, top, cajeros, categorias] = await Promise.all([
          reporteService.getVentasPorPeriodo(desde, hasta, agrupacion),
          reporteService.getProductosMasVendidos(desde, hasta, 10),
          reporteService.getVentasPorCajero(desde, hasta),
          reporteService.getVentasPorCategoria(desde, hasta),
        ]);
        setVentasPeriodo(periodo);
        setTopProductos(top);
        setVentasPorCajero(cajeros);
        setVentasPorCategoria(categorias);
      } catch (err) {
        console.error('Error cargando tab ventas:', err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [desde, hasta, agrupacion]);

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={() => onExportar('ventas')} loading={exporting}>
            <Download className="w-4 h-4 mr-1" /> Exportar Excel
          </Button>
        </div>
      )}

      {/* Evolución de ventas */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Evolución de Ventas</h2>
        {loading ? <Spinner /> : ventasPeriodo.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-sm text-gray-400">Sin datos en el período</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ventasPeriodo} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [formatCurrency(v), 'Ventas']} />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 productos */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top 10 Productos</h2>
            {isAdmin && (
              <button onClick={() => onExportar('productos')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                <Download className="w-3 h-3" /> Excel
              </button>
            )}
          </div>
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {topProductos.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 text-xs text-gray-400 font-mono">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{p.nombre}</span>
                      <span className="text-xs text-gray-500 ml-2 shrink-0">{p.cantidad} uds</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${(p.cantidad / (topProductos[0]?.cantidad || 1)) * 100}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-800 dark:text-white shrink-0">{formatCurrency(p.ingresos)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Ventas por categoría */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Ventas por Categoría</h2>
          {loading ? <Spinner /> : ventasPorCategoria.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-gray-400">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={ventasPorCategoria} dataKey="total" nameKey="categoria" cx="50%" cy="45%" outerRadius={80}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {ventasPorCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [formatCurrency(v)]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Ventas por cajero */}
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Ventas por Cajero</h2>
          {loading ? <Spinner /> : ventasPorCajero.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-gray-400">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ventasPorCajero} layout="vertical" margin={{ left: 80, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="cajero" tick={{ fontSize: 11 }} width={75} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Total']} />
                <Bar dataKey="total" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TabVentas;
