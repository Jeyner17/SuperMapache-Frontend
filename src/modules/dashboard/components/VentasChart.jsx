import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import Card from '../../../shared/components/UI/Card';
import { formatCurrency } from '../../../shared/utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
};

const VentasChart = ({ datos, loading }) => (
  <Card className="p-5 lg:col-span-2">
    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
      Ventas — Últimos 7 días
    </h2>
    {loading ? (
      <div className="h-52 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ) : datos.length === 0 ? (
      <div className="h-52 flex items-center justify-center text-sm text-gray-400">Sin datos</div>
    ) : (
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={datos} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </Card>
);

export default VentasChart;
