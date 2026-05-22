import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '../../../shared/components/UI/Card';
import { formatCurrency } from '../../../shared/utils/formatters';

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
        <BarChart
          data={datos}
          layout="vertical"
          margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="nombre"
            tick={{ fontSize: 11 }}
            width={110}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(v, n, props) => [
              `${props.payload.unidades} uds — ${formatCurrency(props.payload.total)}`,
              props.payload.nombre,
            ]}
            cursor={{ fill: 'rgba(99,102,241,0.05)' }}
          />
          <Bar dataKey="unidades" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11, formatter: (v) => `${v} uds` }}>
            {datos.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )}
  </Card>
);

export default TopProductosChart;
