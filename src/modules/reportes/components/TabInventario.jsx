import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import Card from '../../../shared/components/UI/Card';
import { useAuth } from '../../../shared/hooks/useAuth';
import reporteService from '../services/reporte.service';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

const SkeletonRows = ({ n = 4 }) => (
  <div className="space-y-2">
    {[...Array(n)].map((_, i) => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}
  </div>
);

const TabInventario = ({ onExportar, exporting }) => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  const [loading, setLoading] = useState(false);
  const [stockBajo, setStockBajo] = useState([]);
  const [porVencer, setPorVencer] = useState([]);
  const [valorInventario, setValorInventario] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const [bajo, vencer, valor] = await Promise.all([
          reporteService.getStockBajo(),
          reporteService.getProductosPorVencer(30),
          reporteService.getValorInventario(),
        ]);
        setStockBajo(bajo);
        setPorVencer(vencer);
        setValorInventario(valor);
      } catch (err) {
        console.error('Error cargando tab inventario:', err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  return (
    <div className="space-y-6">
      {/* KPIs de valor */}
      {!loading && valorInventario && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 text-center">
            <p className="text-xs text-gray-500 mb-2">Valor Total Inventario</p>
            <p className="text-2xl font-bold text-indigo-600">{formatCurrency(valorInventario.valor_total)}</p>
          </Card>
          <Card className="p-5 text-center">
            <p className="text-xs text-gray-500 mb-2">Productos Únicos</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{valorInventario.total_productos}</p>
          </Card>
          <Card className="p-5 text-center">
            <p className="text-xs text-gray-500 mb-2">Unidades Totales</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {Number(valorInventario.total_unidades).toLocaleString()}
            </p>
          </Card>
        </div>
      )}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Bajo */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Stock Bajo ({stockBajo.length})
            </h2>
            {isAdmin && (
              <button onClick={() => onExportar('stock_bajo')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                <Download className="w-3 h-3" /> Excel
              </button>
            )}
          </div>
          {loading ? <SkeletonRows /> : stockBajo.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin productos con stock bajo</p>
          ) : (
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left pb-2 text-gray-400 font-medium">Producto</th>
                    <th className="text-right pb-2 text-gray-400 font-medium">Stock</th>
                    <th className="text-right pb-2 text-gray-400 font-medium">Mínimo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {stockBajo.map((p, i) => (
                    <tr key={i}>
                      <td className="py-2 text-gray-700 dark:text-gray-300">{p.nombre}</td>
                      <td className="py-2 text-right font-semibold text-red-600">{p.stock_actual}</td>
                      <td className="py-2 text-right text-gray-500">{p.stock_minimo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Por Vencer */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Por Vencer — 30 días ({porVencer.length})
            </h2>
            {isAdmin && (
              <button onClick={() => onExportar('por_vencer')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                <Download className="w-3 h-3" /> Excel
              </button>
            )}
          </div>
          {loading ? <SkeletonRows /> : porVencer.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin productos próximos a vencer</p>
          ) : (
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left pb-2 text-gray-400 font-medium">Producto</th>
                    <th className="text-right pb-2 text-gray-400 font-medium">Cant.</th>
                    <th className="text-right pb-2 text-gray-400 font-medium">Vence</th>
                    <th className="text-right pb-2 text-gray-400 font-medium">Días</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {porVencer.map((p, i) => (
                    <tr key={i}>
                      <td className="py-2 text-gray-700 dark:text-gray-300">{p.nombre}</td>
                      <td className="py-2 text-right text-gray-600 dark:text-gray-400">{p.cantidad}</td>
                      <td className="py-2 text-right text-gray-500">{formatDate(p.fecha_caducidad)}</td>
                      <td className={`py-2 text-right font-semibold ${p.dias_restantes <= 7 ? 'text-red-600' : 'text-orange-500'}`}>
                        {p.dias_restantes}d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TabInventario;
