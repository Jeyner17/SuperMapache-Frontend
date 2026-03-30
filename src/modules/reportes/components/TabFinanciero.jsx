import { useState, useEffect } from 'react';
import { Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../../../shared/components/UI/Card';
import Button from '../../../shared/components/UI/Button';
import { useAuth } from '../../../shared/hooks/useAuth';
import reporteService from '../services/reporte.service';
import { formatCurrency } from '../../../shared/utils/formatters';

const Spinner = () => (
  <div className="h-64 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const TabFinanciero = ({ desde, hasta, onExportar, exporting }) => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  const [loading, setLoading] = useState(false);
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await reporteService.getIngresosVsGastos(desde, hasta);
        setDatos(data);
      } catch (err) {
        console.error('Error cargando tab financiero:', err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [desde, hasta]);

  const totalIngresos = datos.reduce((s, r) => s + Number(r.ingresos || 0), 0);
  const totalGastos   = datos.reduce((s, r) => s + Number(r.gastos || 0), 0);
  const ganancia      = totalIngresos - totalGastos;

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={() => onExportar('financiero')} loading={exporting}>
            <Download className="w-4 h-4 mr-1" /> Exportar Excel
          </Button>
        </div>
      )}

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Ingresos vs Gastos</h2>

        {loading ? <Spinner /> : datos.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-gray-400">Sin datos en el período</div>
        ) : (
          <>
            {/* Totales */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Total Ingresos</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalIngresos)}</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Total Gastos</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalGastos)}</p>
              </div>
              <div className={`text-center p-4 rounded-xl ${ganancia >= 0 ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                <p className="text-xs text-gray-500 mb-1">Ganancia Neta</p>
                <div className="flex items-center justify-center gap-1">
                  {ganancia >= 0
                    ? <ArrowUpRight className="w-4 h-4 text-indigo-600" />
                    : <ArrowDownRight className="w-4 h-4 text-orange-600" />}
                  <p className={`text-lg font-bold ${ganancia >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
                    {formatCurrency(Math.abs(ganancia))}
                  </p>
                </div>
              </div>
            </div>

            {/* Gráfico */}
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={datos} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, n) => [formatCurrency(v), n === 'ingresos' ? 'Ingresos' : 'Gastos']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" fill="#ef4444" name="Gastos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </Card>
    </div>
  );
};

export default TabFinanciero;
