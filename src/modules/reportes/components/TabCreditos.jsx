import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../../../shared/components/UI/Card';
import reporteService from '../services/reporte.service';
import { formatCurrency } from '../../../shared/utils/formatters';

const TabCreditos = () => {
  const [loading, setLoading] = useState(false);
  const [cartera, setCartera] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await reporteService.getCarteraCreditos();
        setCartera(data);
      } catch (err) {
        console.error('Error cargando tab créditos:', err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const kpis = cartera
    ? [
        { label: 'Total Créditos', value: cartera.total_creditos, color: 'text-gray-800 dark:text-white' },
        { label: 'Monto Total', value: formatCurrency(cartera.monto_total), color: 'text-indigo-600' },
        { label: 'Pendiente', value: formatCurrency(cartera.monto_pendiente), color: 'text-orange-600' },
        { label: 'Vencidos', value: cartera.creditos_vencidos, color: 'text-red-600' },
      ]
    : [];

  const pieData = cartera
    ? [
        { name: 'Pagado', value: Number(cartera.monto_total) - Number(cartera.monto_pendiente) },
        { name: 'Pendiente', value: Number(cartera.monto_pendiente) },
      ]
    : [];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <Card key={i} className="p-5 text-center">
            <p className="text-xs text-gray-500 mb-2">{k.label}</p>
            <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Distribución */}
      {cartera && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Distribución de Cartera</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip formatter={(v) => [formatCurrency(v)]} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};

export default TabCreditos;
