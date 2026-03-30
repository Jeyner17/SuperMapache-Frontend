import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../../../shared/components/UI/Card';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const TopProductosChart = ({ datos, loading }) => (
  <Card className="p-5">
    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
      Top Productos Hoy
    </h2>
    {loading ? (
      <div className="h-52 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ) : datos.length === 0 ? (
      <div className="h-52 flex items-center justify-center text-sm text-gray-400">Sin ventas hoy</div>
    ) : (
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie
            data={datos}
            dataKey="cantidad"
            nameKey="nombre"
            cx="50%"
            cy="45%"
            outerRadius={75}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {datos.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v, n) => [v, n]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    )}
  </Card>
);

export default TopProductosChart;
